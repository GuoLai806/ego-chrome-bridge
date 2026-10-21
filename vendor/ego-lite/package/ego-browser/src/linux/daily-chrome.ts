// Thin opt-in transport. Chrome owns its process/profile and presents its own
// connection approval. Never launch, copy a profile, or close the browser.
import { readFile, lstat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { LinuxBridge } from "./bridge.js";

export async function attachDailyChrome() {
  if (process.platform !== "darwin") throw new Error("Daily Chrome trial is macOS only");
  // Same DevToolsActivePort discovery used by official Chrome DevTools MCP.
  const file = join(homedir(), "Library/Application Support/Google/Chrome/DevToolsActivePort");
  const st = await lstat(file);
  if (!st.isFile() || st.isSymbolicLink() || st.uid !== process.getuid())
    throw new Error("Unowned Chrome discovery file");
  const [port, endpoint] = (await readFile(file, "utf8")).trim().split("\n");
  if (!/^\d+$/.test(port) || +port < 1 || +port > 65535 || !/^\/devtools\/browser\/[\w-]+$/.test(endpoint))
    throw new Error("Invalid local Chrome discovery file");
  const socket = new WebSocket(`ws://127.0.0.1:${port}${endpoint}`);
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { socket.close(); reject(new Error("Chrome approval/connection timed out")); }, 90_000);
    socket.addEventListener("open", () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Chrome connection failed; no alternate browser started")); }, { once: true });
  });
  const input = new PassThrough(), output = new PassThrough();
  let buffer = "";
  input.setEncoding("utf8");
  input.on("data", chunk => {
    buffer += chunk;
    let end: number;
    while ((end = buffer.indexOf("\0")) >= 0) {
      const packet = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      if (packet) socket.send(packet);
    }
  });
  const bridge = new LinuxBridge(input, output);
  socket.addEventListener("message", event => output.write(String(event.data) + "\0"));
  socket.addEventListener("close", () => bridge.close(new Error("Daily Chrome disconnected")));
  socket.addEventListener("error", () => bridge.close(new Error("Daily Chrome connection failed")));
  await bridge.call("Browser.getVersion");
  return { bridge, headless: false, shared: true,
    async close() { bridge.close(); output.destroy(); socket.close(); } };
}
