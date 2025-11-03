import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";


puppeteer.use(StealthPlugin());

export async function scrapeFirstCry(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();

    // Set common browser headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log(`🔍 Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 60000,
    });

    // Wait for any product element to appear
    await page.waitForSelector(
      ".pp-dtl-name, .pdp-name, h1, [itemprop='name']",
      { timeout: 30000 }
    );
    const html = await page.content();
    fs.writeFileSync("debug.html", html);

    const data = await page.evaluate(() => {
      const name =
        document.querySelector(".pp-dtl-name")?.innerText.trim() ||
        document.querySelector(".pdp-name")?.innerText.trim() ||
        document.querySelector("h1")?.innerText.trim() ||
        document.querySelector("[itemprop='name']")?.innerText.trim() ||
        null;

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
    // Remove currency symbols and commas
    	const numeric = priceText.replace(/[₹$,]/g, "").trim();
    // If it looks like "54677" but should be "546.77"
    	if (/^\d{5,}$/.test(numeric)) {
      		price = (parseFloat(numeric) / 100).toFixed(2);
    	} else {
      		price = parseFloat(numeric).toFixed(2);
    	}
  }

      const description =
        document.querySelector(".product_desc")?.innerText.trim() ||
        document.querySelector(".pp-dtl-desc")?.innerText.trim() ||
        document.querySelector("meta[name='description']")?.content ||
        null;

      const main_image =
        document.querySelector(".pp-dtl-imgbox img")?.src ||
        document.querySelector("img[itemprop='image']")?.src ||
        document.querySelector("img")?.src ||
        null;

      return { name, price, description, main_image };
    });

    console.log("✅ Scraped data:", data);

    if (!data.name) {
      console.warn("⚠️ Product data might be hidden or protected");
    }

    return { ...data, url, site: "FirstCry" };
  } catch (err) {
    console.error("❌ Error scraping FirstCry:", err.message);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}
