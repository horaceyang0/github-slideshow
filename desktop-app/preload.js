// Preload kept intentionally minimal for safety; extend when native features are needed.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('inkStudyDesktop', {
  version: '1.0.0'
});
