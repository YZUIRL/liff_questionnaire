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
