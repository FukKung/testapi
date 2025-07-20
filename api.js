const axios = require("axios");
const https = require("https");
const axiosRetry = require("axios-retry").default;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const URL = "https://unpraised.online/login.php";
const TOTAL_REQUESTS = 1500;

const agent = new https.Agent({ rejectUnauthorized: false });

axiosRetry(axios, {
  retries: 2,
  retryDelay: (count) => 200 * count,
  retryCondition: () => true,
});

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/96.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6) Safari/604.1",
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fireRequest(index) {
  try {
    await delay(Math.random() * 50); // กันชนกันเกินไป
    const start = Date.now();
    const res = await axios.get(URL, {
      httpsAgent: agent,
      timeout: 5000,
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html",
      },
    });
    const duration = Date.now() - start;
    console.log(`✅ ${index + 1}/${TOTAL_REQUESTS} | ${res.status} | ${duration}ms`);
  } catch (err) {
    console.log(`❌ ${index + 1}/${TOTAL_REQUESTS} | ${err.message}`);
  }
}

async function runAll() {
  console.log(`🚀 เริ่มยิงทั้งหมด ${TOTAL_REQUESTS} ครั้งพร้อมกัน`);
  const all = Array.from({ length: TOTAL_REQUESTS }, (_, i) => fireRequest(i));
  await Promise.allSettled(all);
  console.log("✅ เสร็จสิ้นครบทุก request");
}

runAll();
