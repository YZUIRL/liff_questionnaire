# CHANGELOG

## [2026-11-03] - 支援網址 `groupId` 參數解析與問卷提交轉發

### 新增 (Added)
- **`groupId` 網址參數讀取與轉發** (`index.html`)：
  - 新增從網址 Query String（以及 `liff.state` 轉跳參數）自動解析 `groupId`（或 `group_id`）。
  - 於問卷送出（`POST /api/liff-questionnaires/public/<survey_key>/responses`）時，將 `group_id` 一併帶入 JSON Payload 與 URL Query String，供 Superpages 後端紀錄作答來源群組並觸發 WebSocket `Sensor` 推播回該 LINE 群組。



## [2026-11-03] - 支援 `<%m.groupid%>` 動態群組參數過濾與個人對話自動回退

### 修改 (Changed)
- **`groupId` 格式驗證** (`index.html`)：僅保留符合 `/^[CR][0-9a-fA-F]{10,}$/` 的有效 LINE 群組/聊天室 ID；若為 `None` 或未替換的 `<%m.groupid%>` 則自動視為空字串，由後端回退推播至填答者個人對話。
