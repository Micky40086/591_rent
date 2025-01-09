



# 591 租屋推播, 目前只能用到 Line Notify EOL

* https://notify-bot.line.me/closing-announce

## 環境準備

1. docker && docker compose

## Setup Instructions

1. 設置 Line Notify Token && 591 URL
    ```
    cp .env.example .env
    # 591 篩選好你要的條件後把網址 URL (記得排序選最新)
    # Line Notify Token
    ```
2. 執行
    ```
    docker compose up -d
    ```
