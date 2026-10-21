# Source and licenses

- Ego SDK, skill and accompanying source: [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite), MIT, Copyright 2026 CitroLabs. Original notice retained in `vendor/ego-lite/LICENSE`.
- Community Chrome host: [PR291](https://github.com/citrolabs/ego-lite/pull/291), source `7bb1545912bf7e7bdf4239a321d36af0e68cb65c` from the `nosliwhtes/ego-lite` `feat/linux-port` branch. It is based on current SDK source including `d392204d1ea1a8027a591ab2b0129c2e11d85f26`; guide version is 2.1.0. This is a community host, not an official Chrome integration endorsed by CitroLabs.
- Our macOS opt-in/daily Chrome transport and owned-target scope changes: source snapshot `6888f9a` on top of the above host. `patches/daily-chrome.patch` contains the complete diff, including the earlier macOS platform opt-in.
- Daily Chrome discovery mechanism was checked against Google's official [Chrome DevTools MCP BrowserManager](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/8b119d9cfe3ed683c082d9a0bcaea56bec3c0e7a/src/BrowserManager.ts), notably local `DevToolsActivePort` discovery. That repository is a reference, not vendored or used as another browser driver.

The complete closed-source EgoLite browser application is NOT included. No Pi engine, Pi plugins, Pi launchers, model accounts, browser profiles or authentication data are included.

The upstream `.github` workflows are nested under `vendor/ego-lite`, retained as source/test fixtures; they do not run as workflows of this repository. Upstream benchmark graphics and product claims are historical upstream materials, not results of this Chrome bridge. Our evidence is under `test-results/`.
