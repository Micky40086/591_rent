



# 591 租屋推播, 目前只能用到 Line Notify EOL

* https://notify-bot.line.me/closing-announce

## 環境準備

1. Node

2. Redis Server

3. 設定 /etc/hosts
    ```
    127.0.0.1 s.591.com.tw
    ```

## Setup Instructions

1. 設置 Line Notify Token
    ```
    // 用你的 Token 取代 index.js <TOKEN>
    ```
2. 設置 TARGET URL
    ```
    // 先在 591 篩選好你要的條件後把網址取代 index.js <URL>
    ```
2. 安裝套件
    ```
    npm install
    npx playwright install
    ```
3. 執行
    ```
    node index.js
    ```
