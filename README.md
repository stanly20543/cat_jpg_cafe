# 🐱 貓圖咖啡 官網系統

## 快速啟動

```bash
# 1. 安裝依賴
npm install

# 2. 啟動伺服器
node server.js

# 3. 開啟瀏覽器
# 前台：http://localhost:3000
# 後台：http://localhost:3000/admin.html
```

## 預設帳號
- **後台密碼**：`catcafe2024`（可在後台設定頁更改）

## 檔案結構
```
catcafe/
├── server.js          # Express 後端 + API
├── package.json
├── data/
│   └── catcafe.db     # SQLite 資料庫（自動建立）
└── public/
    ├── index.html     # 前台網站
    ├── admin.html     # 後台管理介面
    └── uploads/       # 上傳的圖片
```

## API 端點
| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/menu | 取得所有菜單 |
| POST | /api/menu | 新增品項 |
| PUT | /api/menu/:id | 修改品項 |
| DELETE | /api/menu/:id | 刪除品項 |
| GET | /api/settings | 取得網站設定 |
| PUT | /api/settings/batch | 批次更新設定 |
| POST | /api/upload | 上傳圖片（base64） |
| POST | /api/auth/login | 後台登入 |
