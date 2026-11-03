# CHANGELOG

## [2026-11-03] - 支援網址 `groupId` 參數解析與問卷提交轉發

### 新增 (Added)
- **`groupId` 網址參數讀取與轉發** (`index.html`)：
  - 新增從網址 Query String（以及 `liff.state` 轉跳參數）自動解析 `groupId`（或 `group_id`）。
  - 於問卷送出（`POST /api/liff-questionnaires/public/<survey_key>/responses`）時，將 `group_id` 一併帶入 JSON Payload 與 URL Query String，供 Superpages 後端紀錄作答來源群組並觸發 WebSocket `Sensor` 推播回該 LINE 群組。



## [2026-11-03] - 支援 `<%m.groupid%>` 動態群組參數過濾與個人對話自動回退

### 修改 (Changed)
- **`groupId` 格式驗證** (`index.html`)：僅保留符合 `/^[CR][0-9a-fA-F]{10,}$/` 的有效 LINE 群組/聊天室 ID；若為 `None` 或未替換的 `<%m.groupid%>` 則自動視為空字串，由後端回退推播至填答者個人對話。


## [2026-11-03] - LIFF 問卷表單視覺重構為 Minimal Clean Form UI

### 修改 (Changed)
- **Minimal Clean Form UI 全面改版** (`index.html`)：
  - 移除每道題目外圍的深色毛玻璃大卡片，改為簡潔白色表單容器，並移除題目名稱前的 `1. 2. 3.` 自動編號。
  - 統一所有輸入框（文字、多行文字、數字、手機、Email、日期、時間下拉選單）為白底 `#FFFFFF`、細灰框 `#D9DEE5`、`8px` 圓角與 `16px` 字體。
  - 單選（Radio）與多選（Checkbox）改為無外框扁平清單並以 LINE 綠色 `#06C755` 作為選取色。
  - 保留「填入今天日期」與「填入現在時間」快捷按鈕並調整為極簡淺灰小按鈕。
  - 底部提交按鈕改為 LINE 綠色 `#06C755`（高度 `48px`、圓角 `8px`），支援 Sticky 底欄與 `safe-area-inset-bottom`。
  - 完整保留背景底圖（`bg_image`）與外圍主題底色（`theme_color`）設定能力及所有既有驗證與提交流程。
