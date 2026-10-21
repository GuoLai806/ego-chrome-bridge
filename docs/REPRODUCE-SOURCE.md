# 如何核对源码与回退

`vendor/ego-lite/` 已经包含补丁，不要再次在其中应用patch。保留完整上游目录是为了让原构建脚本、skill资源和测试夹具可复现，不代表我们自行写了另一套六万行CU。

若要独立核对，只在另一个空目录下载社区固定源码：

```bash
git clone https://github.com/nosliwhtes/ego-lite.git ego-verify
cd ego-verify
git checkout 7bb1545912bf7e7bdf4239a321d36af0e68cb65c
git apply --unidiff-zero /absolute/path/to/ego-chrome-bridge/patches/daily-chrome.patch
cd package/ego-browser
npm ci --ignore-scripts
npm test
```

不要用最新main代替固定SHA，也不要同时再打旧macos-platform补丁。补丁包含那两项平台改动。

原实机SDK和宿主SHA256见 `test-results/results.json`；新仓库从自己的lockfile独立安装、构建后，两个产物与原实机版本逐字节一致。发行CLI单独位于 `bin/ego-browser`，只增加输入传递和正确模式说明，不改变控件/动作实现。它的七项离线检查另列，不把它们加到554项SDK测试里冒称561项业务验收。

首次上传有Git快照和校验清单，后续修改前保留tag/commit，不覆盖旧证据。回退优先恢复本工具仓库的代码版本；停止当前仓库宿主、关闭临时调试开关后再换版本。不要重置用户Chrome资料、不要把旧target标题当作可继续控制的身份。

在仓库根目录运行 `node scripts/check-manifest.mjs` 核对Git追踪文件。清单对普通文件校验内容，对符号链接校验链接目标字符串，不把目录型链接当作普通文件读；清单本身由Git提交固定。只有审查过的变更才运行 `--write` 重新生成，不应自动用新hash掩盖漂移。

截图缩放修复尚未合入；后续若更改截图算法，应新建补丁/测试记录，不能沿用这里的core hash或历史业务成绩。
