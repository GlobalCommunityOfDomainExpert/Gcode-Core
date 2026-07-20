import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function attempt(n) {
  const page = await browser.newPage();
  let orderBody = null;
  page.on("response", async (res) => {
    if (res.url().includes("razorpay-order")) {
      try {
        orderBody = await res.text();
      } catch {}
    }
  });
  await page.goto("http://localhost:3000/events/21/register", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await page.locator("#full-name").fill("Smoke Test User");
  await page.locator("#email").fill(`smoketest${n}@example.com`);
  await page.getByRole("button", { name: /Pay & Register/i }).click();
  await page.waitForTimeout(2500);

  const rzpFrame = page.frames().find((f) => f.url().includes("razorpay"));
  const text = await page.evaluate(() => document.body.innerText);
  const failed =
    text.includes("Registration failed") || text.includes("returned no data");

  console.log(`--- attempt ${n} ---`);
  console.log("order response body:", orderBody);
  console.log("checkout frame opened:", !!rzpFrame);
  console.log("error banner shown:", failed);
  await page.close();
}

for (let i = 1; i <= 5; i++) {
  await attempt(i);
}
await browser.close();
