# CHANGELOG

## [2026-11-03] - 支援網址 `groupId` 參數解析與問卷提交轉發

### 新增 (Added)
- **`groupId` 網址參數讀取與轉發** (`index.html`)：
  - 新增從網址 Query String（以及 `liff.state` 轉跳參數）自動解析 `groupId`（或 `group_id`）。
  - 於問卷送出（`POST /api/liff-questionnaires/public/<survey_key>/responses`）時，將 `group_id` 一併帶入 JSON Payload 與 URL Query String，供 Superpages 後端紀錄作答來源群組並觸發 WebSocket `Sensor` 推播回該 LINE 群組。
