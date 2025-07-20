import axios from "axios";
import https from "https";
import axiosRetry from "axios-retry";

// ✳️ ปิด TLS Verification ถ้าจำเป็น (ระวังความปลอดภัย)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ✅ URL ปลายทาง
const URL = "https://example.com";

// ✅ จำนวนรอบยิงทั้งหมด
const TOTAL_BATCHES = 5;

// ✅ จำนวน request ต่อรอบ
const BATCH_SIZE = 200;

// ✅ Function สุ่ม User-Agent
function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (Linux; Android 10)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    "Mozilla/5.0 (iPad; CPU OS 13_2_3 like Mac OS X)",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// ✅ ตั้ง retry เมื่อ request fail
axiosRetry(axios, {
  retries: 1,
  retryDelay: retryCount => retryCount * 1000,
  retryCondition: () => true,
});

// ✅ https agent
const agent = new https.Agent({ rejectUnauthorized: false });

async function runBatch(batchNum) {
  console.log(`🚀 เริ่ม Batch ${batchNum}`);
  const tasks = Array.from({ length: BATCH_SIZE }).map((_, i) => {
    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          const res = await axios.get(URL, {
            httpsAgent: agent,
            headers: {
              "User-Agent": getRandomUserAgent(),
              Accept: "text/html",
            },
            timeout: 5000,
          });
          console.log(`✅ (${batchNum}-${i + 1}) status: ${res.status}`);
        } catch (err) {
          console.error(`❌ (${batchNum}-${i + 1})`, err.code || err.message);
        }
        resolve();
      }, i * 10); // Delay 10ms ต่อ request (total ~2s per batch)
    });
  });

  await Promise.all(tasks);
}

async function runAll() {
  for (let i = 1; i <= TOTAL_BATCHES; i++) {
    await runBatch(i);
    await new Promise(resolve => setTimeout(resolve, 1000)); // พัก 1 วินาทีระหว่างรอบ
  }
  console.log("✅ เสร็จแล้วทั้งหมด");
}

runAll();
