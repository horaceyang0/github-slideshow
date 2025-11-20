# pdf.js 离线备份

如果直接双击 `study-app.html` 打开，浏览器可能拦截 CDN worker 的跨域加载。页面已在 file:// 场景自动退回单线程模式，但为了离线或弱网仍能正常工作，可手动下载 pdf.js：

1. 在有网络时执行：
   - `curl -L https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.min.js -o script/pdfjs/pdf.min.js`
   - `curl -L https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.worker.min.js -o script/pdfjs/pdf.worker.min.js`
2. 或者从官方发布页下载同版本文件，放入本目录，文件名保持一致。
3. 重新打开页面，本地 worker 会自动生效。

若缺失备份文件且无网络，页面会提示依赖加载失败。
