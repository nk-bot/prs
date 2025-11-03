import chromium from "@sparticuz/chromium";
import { addExtra } from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

export async function scrapeFirstCry(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("🔍 Navigating to:", url);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector(".pp-dtl-name, .pdp-name, h1", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const name =
        document.querySelector(".pp-dtl-name")?.innerText.trim() ||
        document.querySelector(".pdp-name")?.innerText.trim() ||
        document.querySelector("h1")?.innerText.trim();

      let priceText =
        document.querySelector(".final-price")?.innerText.trim() ||
        document.querySelector(".prod-price")?.innerText.trim() ||
        document.querySelector(".pdp-final-price")?.innerText.trim() ||
        document.querySelector(".price")?.innerText.trim() ||
        document.querySelector(".mrp")?.innerText.trim() ||
        document.querySelector("meta[itemprop='price']")?.content ||
        document.querySelector("meta[property='product:price:amount']")?.content ||
        null;

      let price = null;
      if (priceText) {
        const numeric = priceText.replace(/[₹$,]/g, "").trim();
        price = /^\d{5,}$/.test(numeric)
          ? (parseFloat(numeric) / 100).toFixed(2)
          : parseFloat(numeric).toFixed(2);
      }

      const main_image =
        document.querySelector(".pp-dtl-imgbox img")?.src ||
        document.querySelector("img[itemprop='image']")?.src ||
        document.querySelector("img")?.src;

      return { name, price, main_image };
    });

    console.log("✅ Scraped data:", data);
    return { ...data, url, site: "FirstCry" };
  } catch (err) {
    console.error("❌ Error scraping FirstCry:", err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
