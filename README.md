# 數位修真：天機城失控案（試玩版）

國中資訊科技「系統平臺」闖關課程的網頁試玩版，取自 KUSU 酷書的課程，共 9 章、100 分。

- 根目錄 `/`：**修改建議版**（課名暫定「數位修真錄」），29 題、47 步、分兩節課。故事用修真、操作用真電腦：情境用文言，題目與說明用白話，並加入小電腦模擬器、點選路線、三欄分類、工作管理員讀數與系統日誌等實作。
- `/original/`：**目前正式版**，19 題、37 步，和 KUSU 上現在的內容相同。
- `/changes.html`：**修改對照**，逐關列出改了什麼、為什麼改，並附改前／改後全文。

## 和 KUSU 課堂版的差別

| 項目 | KUSU 課堂版 | 試玩版 |
| --- | --- | --- |
| 故事、閱讀導引、題目、提示、判分、道印 | 有 | 相同 |
| 帳號登入、進度存在 SERVER、換電腦繼續 | 有 | 沒有；進度只存在這個瀏覽器（localStorage） |
| 教師進度頁、CSV 匯出 | 有 | 沒有 |

換電腦、換瀏覽器、用無痕視窗或清除瀏覽資料，就會從頭開始。上方的「重新開始」會清除目前這個版本的進度。

## 在自己電腦預覽

網頁使用 JavaScript 模組，直接雙擊 `index.html` 會無法載入。在這個資料夾裡執行：

```bash
python -m http.server 8000
```

再打開 `http://localhost:8000/`。

## 檔案說明

| 檔案 | 用途 |
| --- | --- |
| `index.html`、`app.mjs` | 試玩版外框與封面（取代 KUSU 的登入頁） |
| `interact.css` | 修改建議版的新互動（模擬器、點選路線、分類、讀數、日誌） |
| `engine.mjs` | 步驟、判分、提示與道印規則（與 KUSU SERVER 相同，進度改存在瀏覽器；判對錯的規則寫在 `content.mjs`） |
| `content.mjs` | 章節、故事與題目 |
| `lessons.mjs` | 每一關的閱讀導引與插圖說明 |
| `experience.mjs` | 閱讀與作答畫面（修改建議版另含模擬器與新題型） |
| `course.css`、`reading.css`、`compact.css` | 課程樣式（與 KUSU 相同） |
| `preview.css` | 試玩版的版本切換與封面按鈕 |
| `images/manifest.json` | 插圖清單；插圖完成前是空的，畫面顯示城景剪影 |
| `original/` | 目前正式版；除了 `index.html`、`app.mjs`、`engine.mjs`、`preview.css`，其餘檔案與 KUSU 逐字相同 |
| `changes.html`、`changes.css` | 修改對照頁 |
| `LICENSE`、`LICENSE-CONTENT.md` | 授權 |
| `.nojekyll` | 讓 GitHub Pages 原樣提供所有檔案 |

## 授權

- **程式碼**：MIT，見 `LICENSE`。
- **課程內容**：CC BY-NC-SA 4.0，見 `LICENSE-CONTENT.md`。使用時請標示「數位修真：天機城失控案，KUSU 酷書，CC BY-NC-SA 4.0」、不得商業使用，改編後要用相同授權分享。

© 2026 KUSU 酷書
