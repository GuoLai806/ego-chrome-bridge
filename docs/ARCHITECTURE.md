# 架构与边界

```text
同事自己的Agent/模型
  → ego-browser nodejs（本地脚本入口）
  → 原Ego2.1 TaskSpace / Page / snapshot / ref / action
  → 私有Unix socket宿主
  → 本机Chrome官方授权WebSocket/CDP
  → 日常Chrome中本轮新建标签
```

## 哪些是现成的，哪些是我们的

| 层 | 来源 | 此次处理 |
| --- | --- | --- |
| 使用指南、Page动作与引用管理 | 上游 Ego2.1 | 保留，不降级旧社区SDK |
| 标准Chrome AX快照宿主、跨CLI状态、私有socket | 社区 PR291 | 固定源码复用 |
| macOS平台启用 | 我们的薄适配 | 只有显式EGO_LINUX=1才启用 |
| 日常Chrome连接 | 我们的薄适配，参考Google官方连接发现 | 经本机DevToolsActivePort找到回环端点，仍需Chrome批准 |
| 共享登录环境中的目标归属 | 我们的薄适配 | 显式记录本轮新target＋真实opener后代，不按标题/标签数量猜 |
| 模型决策 | 仓库外 | 没有Pi、第二模型、OCR或任务规划层 |

主代码位于 `vendor/ego-lite/package/ego-browser/src/linux/`；目录名沿用上游，不表示日常Chrome连接只供Linux。新连接文件 `daily-chrome.ts` 只验证了macOS。

## 观察与动作

以新控件快照/页面文字为依据，模型选择Ego动作，执行后返回新观察。已有编号绑定页面/文档/节点，不把标题相似当身份，也不把HTTP成功当任务完成。快照当前主要覆盖主文档；不能宣称跨iframe与官方EgoLite完全等价。

截图是可选能力，不是每步必需。画面确有必要才用；当前非默认页面缩放有缺陷，不能用该图可靠推坐标。控件/文字任务已经完成时，非必要截图缺陷只记为旁路问题，不反向否定任务结果。

## 日常模式的安全边界

- 不创建隔离BrowserContext，Cookie/登录/存储与日常环境共享。TaskSpace只是任务标签分组，不是浏览器级安全沙箱。
- 全部目标元数据由宿主在本机取回过滤；不会把其他标签页面DOM交给模型。
- 只注册显式创建目标或opener已属于任务的弹出页。未知来源标签不会仅凭名称/URL加入。
- 禁止任务通过宿主对未知target建立会话、激活或关闭；关闭TaskSpace只关闭记录中的仍存活目标。
- stop断开WebSocket，不杀Chrome进程。不会降级到另一个浏览器来掩盖连接失败。
- Chrome本身授予的是全会话调试能力，宿主标签检查不等于权限最小化；不要用本试验入口承诺可对抗恶意Agent/恶意站点或持续输入竞争。

没有新增任何AI服务、远程遥测或网页后门。页面内容会进入调用者选择的Agent模型上下文，这是调用者的隐私边界，使用前要自行评估。
