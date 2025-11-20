# Your GitHub Learning Lab Repository for Introducing GitHub

Welcome to **your** repository for your GitHub Learning Lab course. This repository will be used during the different activities that I will be guiding you through. See a word you don't understand? We've included an emoji 📖 next to some key terms. Click on it to see its definition.

Oh! I haven't introduced myself...

I'm the GitHub Learning Lab bot and I'm here to help guide you in your journey to learn and master the various topics covered in this course. I will be using Issue and Pull Request comments to communicate with you. In fact, I already added an issue for you to check out.

![issue tab](https://lab.github.com/public/images/issue_tab.png)

I'll meet you over there, can't wait to get started!

This course is using the :sparkles: open source project [reveal.js](https://github.com/hakimel/reveal.js/). In some cases we’ve made changes to the history so it would behave during class, so head to the original project repo to learn more about the cool people behind this project.

## PDF 题库随机出题页

仓库新增了 `study-app.html`，提供网页端的“上传 PDF 题库并随机截图出题”能力：

1. 打开 `study-app.html`（推荐在本地静态服务器中访问以避免浏览器的本地文件安全限制）。
2. 上传或拖拽你的 PDF 题库，等待解析完成。
3. 点击“随机出题”即可从任意页面生成截图，配合“下载当前截图”保存题目图片。

页面内置 pdf.js，无需后台服务即可运行，适合快速刷题或制作题目卡片。

> 小贴士：如直接双击打开出现跨域或加载失败提示，可在仓库根目录运行 `npx http-server . -p 8000` 后，通过浏览器访问 `http://localhost:8000/study-app.html`。
