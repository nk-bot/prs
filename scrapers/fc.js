import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

export async function scrapeFirstCry(url) {
  console.log("🔍 Launching headless browser for:", url);

  // Get path to Vercel-compatible Chromium binary
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  const data = await page.evaluate(() => {
    const name =
      document.querySelector("h1")?.innerText.trim() ||
      document.querySelector("meta[property='og:title']")?.content ||
      null;

    const priceText =
      document.querySelector(".th-discounted-price .prod-price")?.textContent.trim() ||
      document.querySelector(".prod-price")?.textContent.trim() ||
      document.querySelector(".newmrp")?.textContent.trim() ||
      null;

    let price = null;
    if (priceText) {
      const numeric = priceText.replace(/[₹,\s]/g, "").trim();
      price = parseFloat(numeric) || null;
    }

    const image =
      document.querySelector("meta[property='og:image']")?.content ||
      document.querySelector("img")?.src ||
      null;

    const description =
      document.querySelector(".pdp-product-description-content")?.innerText.trim() ||
      document.querySelector("meta[name='description']")?.content ||
      "";

    return { name, price, image, description };
  });

  await browser.close();

  if (!data.name || !data.price) {
    console.warn("⚠️ Missing data for URL:", url);
  }

  return { ...data, url, site: "FirstCry" };
}
