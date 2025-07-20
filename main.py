import asyncio
import aiohttp
import random
import time

URL = "https://unpraised.online/login.php"
TOTAL_REQUESTS = 1500
MAX_RETRIES = 2

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/96.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6) Safari/604.1",
]

def get_random_user_agent():
    return random.choice(USER_AGENTS)

async def delay(ms):
    await asyncio.sleep(ms / 1000)

async def fetch(session, index):
    await delay(random.uniform(0, 50))  # delay 0-50 ms to avoid bursting
    start = time.time()
    headers = {
        "User-Agent": get_random_user_agent(),
        "Accept": "text/html"
    }
    for attempt in range(1, MAX_RETRIES + 2):  # first try + retries
        try:
            async with session.get(URL, headers=headers, timeout=5) as response:
                duration = int((time.time() - start)*1000)
                print(f"✅ {index+1}/{TOTAL_REQUESTS} | {response.status} | {duration}ms")
                return
        except Exception as e:
            if attempt <= MAX_RETRIES:
                await asyncio.sleep(attempt * 0.2)  # retry delay: 200ms, 400ms, ...
            else:
                print(f"❌ {index+1}/{TOTAL_REQUESTS} | {str(e)}")
                return

async def run_all():
    print(f"🚀 เริ่มยิงทั้งหมด {TOTAL_REQUESTS} ครั้งพร้อมกัน")
    timeout = aiohttp.ClientTimeout(total=10)
    connector = aiohttp.TCPConnector(ssl=False)  # ปิด ssl verify เหมือน axiosAgent
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        tasks = [fetch(session, i) for i in range(TOTAL_REQUESTS)]
        await asyncio.gather(*tasks)
    print("✅ เสร็จสิ้นครบทุก request")

if __name__ == "__main__":
    asyncio.run(run_all())
