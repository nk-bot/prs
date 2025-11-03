import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeMyntra(url) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const response = await axios.get(url, { headers });
  const $ = cheerio.load(response.data);

  const name =
    $("h1.pdp-title").text().trim() ||
    $("meta[property='og:title']").attr("content");

  let price =
    $("meta[property='product:price:amount']").attr("content") ||
    $(".pdp-price").text().trim() ||
    $(".price").first().text().trim();

  if (!price) {
    const scripts = $("script[type='application/ld+json']");
    scripts.each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json.offers?.price) {
          price = json.offers.price;
          return false;
        }
      } catch {}
    });
  }

  const main_image =
    $("meta[property='og:image']").attr("content") ||
    $("img.pdp-image").first().attr("src");

  const description =
    $("div.pdp-product-description-content").text().trim() ||
    $("meta[name='description']").attr("content");

  return {
    name,
    price: price || "N/A",
    description,
    main_image,
    url,
  };
}
