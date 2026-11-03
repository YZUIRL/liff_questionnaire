# LIFF 問卷調查前端系統架構文件 (ARCHITECTURE.md)

## 1. 系統總覽
本專案 (`YZUIRL/liff_questionnaire`) 為 Superpages 後台管理系統之 LIFF 問卷填寫端單頁應用程式 (`index.html`)，託管於 GitHub Pages 並綁定 LINE LIFF Endpoint (`2009851813-eNpc9OUb`)。

## 2. 核心架構與資料流
1. **環境檢測与電腦版攔截 (`isDesktopBrowser`)**：
   - 整合 `liff.isInClient()` 與 User-Agent 行動裝置特徵偵測，於桌面瀏覽器開啟時主動攔截並提示「請使用LINE開啟此連結」。
2. **網址與 `liff.state` 參數解析**：
   - 解析 `oaId`、`surveyId`、`botAppName`、`defaultTags`、`backend` 以及目標群組識別碼 `groupId`。
3. **LINE LIFF SDK 身分驗證 (`initializeLiff`)**：
   - 初始化 LIFF SDK，取得填寫者之 `liff.getProfile()` 與 `liff.getIDToken()`。
4. **動態題型渲染與防呆驗證 (`renderSurvey`, `submitForm`)**：
   - 支援文字 (`text`)、數字 (`number`)、單選 (`single_choice`)、多選 (`multiple_choice`)、手機 (`phone`)、Email (`email`)、日期 (`date`)、時間 (`time`) 等 8 種題型與行動端友善 UI。
5. **問卷提交與群組 `groupId` 透傳 (`submitForm`)**：
   - 將作答內容、LINE 身分憑證與 `group_id` 透過 `POST /api/liff-questionnaires/public/<surveyId>/responses` 提交至 Superpages 後端，觸發標籤標註、自動旅程、圖文選單切換及 WebSocket `Sensor` 群組/個人推播事件。



## [2026-11-03] 動態群組參數 `<%m.groupid%>` 合法性過濾
- 於 `index.html` 解析 `groupId` 時加入 `/^[CR][0-9a-fA-F]{10,}$/` 格式驗證，當網址由個人對話觸發（`groupId=None`）或未經機器人替換（`groupId=<%m.groupid%>`）時自動轉為空字串 `''`，確保同一條問卷連結可跨群組與個人對話通用。


## [2026-11-03] LIFF 表單 UI 風格統一與視覺重構（Minimal Clean Form UI）

### 1. 視覺重構與設計原則
- **Minimal Clean Form UI / Mobile-first 扁平化表單**：
  - 移除每道題目外圍獨立的深色半透明毛玻璃卡片（Glassmorphism）、漸層與過度陰影，改為統一的高可讀性白色主要表單容器（`#FFFFFF` / `rgba(255, 255, 255, 0.96)`）。
  - **保留自訂背景圖片 (`bg_image`) 與外圍底色 (`theme_color`)**：當問卷有設定 `bg_image` 或非白色 `theme_color` 時，`body` 維持顯示背景圖片（`cover` / `center` / `fixed`）或外圍底色，而中間表單容器保持白底與圓角邊框，確保深色、淺色或高對比背景圖片下表單文字皆清晰易讀。
- **表單元件統一樣式**：
  - **Label（欄位標籤）**：移除自動題號（`1.`、`2.`），統一使用 `13.5px`、`#8291A5`、與輸入框間距 `7px`，欄位區塊間距 `18px`，必填星號為 `#EF4444`。
  - **Input / Textarea / Date / Time Select**：統一為白底 `#FFFFFF`、細灰邊框 `1px solid #D9DEE5`、圓角 `8px`、單行高度 `46px`、內距 `11px 14px`、字體 `16px`（防止手機瀏覽器點擊自動放大）、文字色 `#1F2937`、Placeholder `#9CA3AF`；Focus 邊框與光暈採用 LINE 綠色 `#06C755`。
  - **日期與時間快捷列**：保留「填入今天日期」與「填入現在時間」快捷按鈕，改為極簡淺灰小按鈕樣式（`#F3F4F6` 底、`#E5E7EB` 框、`12.5px`）。
  - **Radio / Checkbox**：移除大型半透明選項框，改為左靠齊圓形 Radio / 方形 Checkbox 清單，選取識別色統一為 `#06C755`。
  - **主要操作按鈕 (`.btn-submit`)**：固定為 LINE 綠色 `#06C755`、白字 `#FFFFFF`、圓角 `8px`、高度 `48px`、字重 `600`，搭配底部 Sticky 區塊與 `env(safe-area-inset-bottom)` 手機安全區域內距。


## [2026-11-03] 拆分「文字 (`text`)」與「多行文字 (`textarea`)」答案類型
- `renderSurvey()` 針對 `answer_type === 'text'` 渲染單行 `<input type="text" class="input-text">`（不可換行、高度 `46px`）；針對 `answer_type === 'textarea'` 渲染多行 `<textarea class="input-text" rows="3">`（可換行、最小高度 `92px`）。

## [2026-11-03] 移除內部除錯用「API 與環境設定」齒輪按鈕與彈窗
- 徹底移除右上角除錯齒輪圖示 (`.config-trigger`)、設定彈窗 (`.config-modal`、`#config-overlay`) 與相關 JS 函式 (`toggleConfig`, `saveConfig`)。
- 確保一般使用者在 LINE LIFF 開啟問卷時不會看到或點擊到開發者除錯視窗，API Origin 一律由 URL 參數 (`backend`)、預設伺服器網址自動解析。
