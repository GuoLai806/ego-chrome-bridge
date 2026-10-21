# 安装、使用和回退（macOS）

## 1. 前提与构建

已验证：macOS arm64、Node26.4.0、Google Chrome155.0.8059.85。代码要求 Node22+；Chrome 官方会话连接功能要求较新的 Chrome（官方文档描述为144+），本仓库没有逐个版本复测。

克隆仓库，在根目录执行：

```bash
npm ci --ignore-scripts --prefix vendor/ego-lite/package/ego-browser
npm run build
npm test
export PATH="$PWD/bin:$PATH"
ego-browser skill
```

`--ignore-scripts` 避免依赖安装阶段运行上游 prepare/git-hook步骤；显式 build 会生成 SDK。不要用官方安装脚本替代上述命令：它可能安装 EgoLite 应用，而不是此 Chrome 接入。不要直接修改 vendor 的快照/点击算法来适配单个网页。

## 2. 明确授权日常 Chrome

1. 正常打开自己的 Google Chrome，不需要复制用户目录、导出 Cookie或用特殊启动参数重开。
2. 打开 `chrome://inspect/#remote-debugging`，阅读并勾选允许本浏览器实例远程调试。
3. 第一次 `ego-browser nodejs ...` 连接时，Chrome可能弹“Allow remote debugging?”。只在信任当前工具时确认本次连接。本工具不代点确认，不绕过权限，不设置始终允许。
4. 只在自己能看见并同意的会话中试用。浏览器授权很广，可访问保存数据与站点状态；我们的 target过滤不是Chrome权限限制。多个Chrome Profile/非标准用户目录尚未验证。

如果没有 `DevToolsActivePort` 或连接被拒绝，就应报告未连接，不能自动转到无痕/另一浏览器冒充成功。CLI 不读取浏览器Cookie数据库或模型认证文件。连接端点不应贴到聊天/提交仓库。

## 3. 调用方式

先读匹配指南：`ego-browser skill`。之后可用文件：

```bash
ego-browser nodejs examples/observe.mjs
```

也可用stdin（上游原生形状）：

```bash
ego-browser nodejs <<'JS'
const task=await taskSpace('my-first-task');
const page=task.page('p1');
await page.goto('https://example.com');
console.log(await page.snapshot());
await task.finish({keep:[]});
JS
```

本仓库局部包装支持 `nodejs file.mjs` 和指南中的 `nodejs -e CODE`，只是把内容传到上游stdin，不做模型规划。不要误认为上游裸 `dist/out/index.js nodejs file.mjs` 也支持这些参数。后续轮次用同一个spaceId和Page标签，读到新状态后再行动；一轮一个新文件，避免重放旧动作。

连接任意 Agent 时，只需给它本仓库 `bin/ego-browser` 绝对路径及 `skill` 输出。该工具不提供模型服务或Agent程序；同事自备自己批准的Agent/模型。不要把本机Pi或其他人的认证目录复制给同事。

## 4. 完成、停止与回退

- 正常任务由 `task.finish({keep:[]})` 清理本轮标签；需给用户保留结果时显式 keep，finish后不要再操作旧句柄。
- Ctrl+C结束当前CLI脚本不等于已完成页面清理，不要重放不确定投递。先根据当前观察确认结果。
- 不再使用时运行 **同一仓库** 的 `ego-browser stop`；它连接该仓库私有宿主并断开，不发送 Browser.close，也不结束日常Chrome。
- 回Chrome关闭本次调试开关。保留的结果页由用户决定是否关闭；已有用户页不要批量关闭。
- 回退只需移除当前终端的PATH设置或关闭终端，不再使用本入口。不改全局Agent、不改日常Chrome登录资料；不需要重装Pi或其他Agent。

宿主状态在本机短路径的用户私有临时目录，按用户ID与本仓库位置区分，Unix socket私有。不要把该目录复制到另一台机器或上传。宿主停止/失效后旧任务句柄会失效；目标过滤记录不是永久数据库。

## 5. 重要限制

这是日常Chrome共享登录环境，不是无痕隔离；自动化可能留下站点浏览历史。没有实现系统级独占键鼠锁或官方EgoLite蓝框接管UI。用户操作界面时，Agent应按明确接管信息停下，不能宣称驱动自动检测了所有干扰。截图路径的非默认缩放缺陷见 [已知问题](KNOWN-ISSUES.md)。
