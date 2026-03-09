# 在 Cursor 内置浏览器中预览 stars_ai_preview.html

## 步骤

### 1. 启动本地服务器

在 Cursor 里任选一种方式：

**方式 A：用任务（推荐）**

- 按 **Ctrl+Shift+P** → 输入 **Tasks: Run Task**
- 选择 **「启动本地预览服务器 (端口 4173)”**
- 在终端里看到类似 `Serving HTTP on 0.0.0.0 port 4173` 就说明已启动

**方式 B：用终端**

- 按 **Ctrl+`** 打开终端
- 执行：
  ```powershell
  cd "c:\Users\kingdee.gbl\Downloads\Protocol"
  python -m http.server 4173 --bind 127.0.0.1
  ```
- 保持这个终端窗口不要关

### 2. 在 Simple Browser 里打开页面

- 按 **Ctrl+Shift+P** → 输入 **Simple Browser: Show** 并回车
- 在地址栏**只粘贴**下面这一行（不要加空格或换行）：
  ```
  http://127.0.0.1:4173/stars_ai_preview.html
  ```
- 回车

---

若仍出现 **ERR_EMPTY_RESPONSE (-324)**：Cursor 内置 Simple Browser 在某些环境下无法访问本机服务器（已知限制）。请改用系统浏览器：
- **Ctrl+Shift+P** → **Tasks: Run Task** → 选择 **「在系统浏览器中打开 stars_ai_preview（若 Simple Browser 报 -324 用此方式）」**（需先保持上面的服务器在运行）。
