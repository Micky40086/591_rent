const { chromium } = require("playwright");
const axios = require("axios");
const redis = require("redis");
const intervalMinutes = 5; // 每隔 5 分鐘執行一次

require('dotenv').config();
const URL = process.env.URL;
const TOKEN = process.env.TOKEN;

(async () => {
  const client = redis.createClient({
    host: "127.0.0.1", // Redis 伺服器地址
    port: 6379, // Redis 伺服器端口
  });

  await client.connect();

  async function scrapeTask() {
    console.log("Starting task at:", new Date());

    // 啟動瀏覽器
    const browser = await chromium.launch({ headless: true }); // 設為 true 可啟動無頭模式
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    // 瀏覽到指定頁面
    await page.goto(URL);
    await page.waitForLoadState("load");

    const items = await page.$$("div.item");

    for (const item of items) {
      const link = await item.$("div.item-info div.item-info-title a");

      if (link) {
        const href = await link.getAttribute("href"); // 提取 href 屬性
        const textContent = await link.textContent(); // 提取文字內容
        // console.log(`Href: ${href}`);
        // console.log(`Text Content: ${textContent}`);
        // console.log("---");

        const id = href.split("/").slice(-1)[0];
        const isExist = await client.sIsMember("id_arr", id.toString());

        if (isExist) {
          console.log(`id=${id} is Exist`)
          continue;
        }

        try {
          const cutPhoto = await getFirstCutPhoto(id);
          await sendLineNotifyMessage(textContent, cutPhoto, href);
          await client.sAdd("id_arr", id.toString());
        } catch (error) {
          console.error("Error:", error.message);
        }

        await new Promise((r) => setTimeout(r, 2000)); // 每次處理延遲 2 秒
      }
    }

    await browser.close();
  }

  // 定期執行任務
  setInterval(
    async () => {
      try {
        await scrapeTask();
      } catch (error) {
        console.error("Error during scheduled task:", error.message);
      }
    },
    intervalMinutes * 60 * 1000,
  );

  // 立即執行一次
  await scrapeTask();

  // 確保程式不結束
  process.stdin.resume();
})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFirstCutPhoto(id) {
  try {
    const response = await axios.get(
      `https://api.591.com.tw/tw/v1/house/photos?type=1&id=${id}`,
    );
    const data = response.data;

    if (
      data.status === 1 &&
      data.data &&
      data.data.photos &&
      data.data.photos.length > 0
    ) {
      return data.data.photos[0].cutPhoto;
    } else {
      throw new Error("No photos found or invalid response format");
    }
  } catch (error) {
    console.error("Error fetching API:", error.message);
    throw error;
  }
}

async function sendLineNotifyMessage(message, imageUrl, linkUrl) {
  try {
    const formData = new URLSearchParams();
    formData.append("message", `${message}\n${linkUrl}`);
    if (imageUrl) {
      formData.append("imageThumbnail", imageUrl);
      formData.append("imageFullsize", imageUrl);
    }

    const response = await axios.post(
      "https://notify-api.line.me/api/notify",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${TOKEN}`,
        },
      },
    );

    if (response.status === 200) {
      console.log("Message sent successfully!");
    } else {
      console.error("Failed to send message:", response.data);
    }
  } catch (error) {
    console.error("Error sending LINE Notify message:", error.message);
  }
}
