# Ego Chrome Bridge

**把 Ego 2.1 的浏览器工具接到用户明确授权的日常 Google Chrome。独立于任何 Agent，不包含 Pi。**

同事可以把这个命令行工具交给自己使用的 Agent。Agent 读取页面控件/文字、决定动作，Ego 执行动作并返回新观察。没有第二模型、OCR、任务路由器或网页专用填表后门。

## 当前状态

- 已在 macOS、日常 Google Chrome 155 上实测填表、KS三项目调研、B站前五视频/评论，业务结果完成。
- **已知缺陷：90% 等非默认网站缩放下，截图尺寸/裁剪可能错误，深滚动甚至白图。尚未修复。** 控件和文字任务不因非必要截图而判失败；需要依赖画面/坐标时不能把错误图片当可靠依据。
- 桌面原生应用、任意 Chrome Profile、Windows/macOS各版本和统计稳定性不在本轮证明范围。
- 这是开源 SDK＋社区 Chrome 宿主＋我们的薄适配，不是完整 EgoLite 浏览器，也不是官方产品发布。

## 快速开始

需要 Node.js22+、npm 和已运行的正常 Google Chrome。进入仓库后：

```bash
npm ci --ignore-scripts --prefix vendor/ego-lite/package/ego-browser
npm run build
npm test
export PATH="$PWD/bin:$PATH"
ego-browser skill
```

然后在 Chrome 打开 `chrome://inspect/#remote-debugging`，**由使用者明确允许本次连接**。权限涉及整个浏览器，不能被本工具的标签过滤等同为浏览器权限沙箱。请先阅读 [安装与权限说明](docs/INSTALL.md)。

```bash
ego-browser nodejs examples/observe.mjs
ego-browser stop
```

示例只创建一张新标签、读取 example.com 并清理，不操作原有页面。`stop` 只停止当前仓库的宿主/断开连接，不退出日常 Chrome。结束后手动关闭本次临时远程调试开关。

**不执行 `npm link`，不覆盖你已有的 ego-browser，不修改任何 Agent 配置，不带模型 API key。** PATH 仅对当前终端生效；其他 Agent 可直接调用本仓库 `bin/ego-browser` 的绝对路径。

## 给同事看的资料

- [安装、使用、退出和回退](docs/INSTALL.md)
- [架构与安全边界](docs/ARCHITECTURE.md)
- [开发过程、来源与后续优先项](docs/DEVELOPMENT.md)
- [固定源码复现与回退](docs/REPRODUCE-SOURCE.md)
- [三项实测结果与证据限制](test-results/README.md)
- [截图缩放缺陷复现与定位](docs/KNOWN-ISSUES.md)
- [可移植试用任务](test-prompts/README.md)
- [来源与许可](THIRD_PARTY_NOTICES.md)

## 代码结构

```text
bin/ego-browser                 本仓库局部命令；不启动任何Agent或模型
vendor/ego-lite/                固定开源Ego源码＋已实测的Chrome宿主补丁
  package/ego-browser/src/      控件快照、引用、动作、CDP桥和生命周期
  skills/ego-browser/           上游使用说明与网站知识
patches/daily-chrome.patch      相对固定社区源码的完整改动
docs/                          安装、设计、开发与问题记录
test-results/                  脱敏历史实测结果＋本次打包检查
test-prompts/                  不依赖任何Agent发行版的试用任务
```

默认使用新观察中的控件/文字，不强制每步截图。原有用户标签不进入本轮任务列表；只有本轮创建的标签及真实 opener 关联的弹出页进入任务。日常登录环境共享，不复制 Cookie，也不重启 Chrome。

仓库不含：Pi源码/插件/启动器、任何模型配置、API key、Chrome Profile、原始登录态截图、完整私有会话或闭源 EgoLite 应用。此前测试运行器的名称仅作为实测条件记录在文档中。

MIT；上游 CitroLabs 许可完整保留。请以本仓库 `test-results/` 为实测依据，不把 vendor 中的原产品基准图当成本接入的测试成绩。
