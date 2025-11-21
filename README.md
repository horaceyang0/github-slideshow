# Your GitHub Learning Lab Repository for Introducing GitHub

Welcome to **your** repository for your GitHub Learning Lab course. This repository will be used during the different activities that I will be guiding you through. See a word you don't understand? We've included an emoji 📖 next to some key terms. Click on it to see its definition.

Oh! I haven't introduced myself...

I'm the GitHub Learning Lab bot and I'm here to help guide you in your journey to learn and master the various topics covered in this course. I will be using Issue and Pull Request comments to communicate with you. In fact, I already added an issue for you to check out.

![issue tab](https://lab.github.com/public/images/issue_tab.png)

I'll meet you over there, can't wait to get started!

This course is using the :sparkles: open source project [reveal.js](https://github.com/hakimel/reveal.js/). In some cases we’ve made changes to the history so it would behave during class, so head to the original project repo to learn more about the cool people behind this project.

## PDF 题库随机出题页（网页 & 桌面程序）

`study-app.html` 依旧提供网页端的“上传 PDF 题库并随机截图出题”体验，而 `desktop-app` 目录新增了 Electron 封装，方便一键运行：

网页使用方法：
1. 打开 `study-app.html`（推荐在本地静态服务器中访问以避免浏览器的本地文件安全限制）。
2. 在“科目”“年份”“随机出题数量”中填入当前题库属性，可在同一页面加载多套科目/年份并随时切换。
3. 上传或拖拽对应 PDF 题库，等待解析完成；如有标准答案，可上传 JSON/CSV/TXT（格式示例：`{"answers":[{"page":1,"answer":"A"}]}` 或 `1,A`），用于快速比对 5 个选项的对错。
4. 点击“按年份随机出题”即可从指定题库生成 N 道截图，页面附带 A-E 五个选项，若上传了答案会即时标记正误。
5. 若想要题目讲解，可在页面内填写支持视觉模型的 OpenAI 兼容接口地址与 API Key，点击“AI 解析并跳转”将滚动至解析区并请求接口，进度条同步显示解析状态。
6. 如果直接用 `file://` 双击打开，浏览器可能拦截 CDN worker 请求。页面会自动退回单线程解析，若仍遇到加载问题，可按 `script/pdfjs/README.txt` 提示下载本地备份。

桌面程序使用方法：
1. 确保已安装 Node.js，然后进入 `desktop-app` 目录执行 `npm install`（如网络限制导致下载 electron 失败，可根据本地源策略调整 registry 或离线缓存）。
2. 运行 `npm start`，桌面窗口将直接打开父目录下的 `study-app.html`，无需再考虑浏览器的本地安全策略。
3. 题库上传、随机出题、AI 解析与进度条等功能与网页端一致。

页面内置 pdf.js，无需后台服务即可运行，适合快速刷题或制作题目卡片。

> 小贴士：如直接双击打开出现跨域或加载失败提示，可在仓库根目录运行 `npx http-server . -p 8000` 后，通过浏览器访问 `http://localhost:8000/study-app.html`；或直接使用上面的桌面程序方式打开。

### 重新生成本地 diff
如果需要在本地重新生成近期涉及 Study App 的文件差异（不依赖 GitHub 视图），可运行：

```bash
bash script/regenerate-diff.sh # 默认生成 HEAD^..HEAD 的差异到 local-study-app.diff
```

可通过传参指定其他提交范围与输出路径，例如：

```bash
bash script/regenerate-diff.sh <起始提交> <目标提交> /tmp/my-diff.patch
```
