from locust import HttpUser, task, between
import random

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/96.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6) Safari/604.1",
]

class LoadTestUser(HttpUser):
    wait_time = between(0.01, 0.05)

    def on_start(self):
        # ปิด verify ssl
        self.client.verify = False

    @task
    def heavy_load(self):
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html",
        }
        self.client.get("/login.php", headers=headers)
