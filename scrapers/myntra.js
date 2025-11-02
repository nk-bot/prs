import * as cheerio from "cheerio";
import { fetchPage } from "../helpers/fetchpage.js";

export async function scrapeMyntra(url) {
  const data = await fetchPage(url);
  const $ = cheerio.load(data);

  const name =
    $("h1.pdp-title").text().trim() ||
    $("meta[property='og:title']").attr("content");

  let price =
  $("meta[property='product:price:amount']").attr("content") ||
  $(".price").first().text().trim() ||
  $(".prod-price").first().text().trim();

// If price is still missing, look for embedded JSON data
if (!price) {
  const scripts = $("script[type='application/ld+json']");
  scripts.each((i, el) => {
    try {
      const jsonText = $(el).html();
      if (jsonText && jsonText.includes("price")) {
        const jsonData = JSON.parse(jsonText);
        if (jsonData.offers && jsonData.offers.price) {
          price = jsonData.offers.price;
          return false; // break loop
        }
      }
    } catch (e) {
      // ignore invalid JSON
    }
  });
}

// Fallback
price = price || "Price not available";


  const availability = data.includes("OUT_OF_STOCK")
    ? "Out of Stock"
    : "In Stock";

  const description =
    $("div.pdp-product-description-content").text().trim() ||
    $("meta[name='description']").attr("content");

  const main_image =
    $("img.pdp-image").first().attr("src") ||
    $("meta[property='og:image']").attr("content");

  const additional_images = [];
  $("img.pdp-image").each((i, el) => {
    const src = $(el).attr("src");
    if (src) additional_images.push(src);
  });

  const variants = [];
  $(".size-buttons-size-button").each((i, el) => {
    variants.push($(el).text().trim());
  });

  return {
    name,
    price,
    availability,
    description,
    main_image,
    additional_images,
    variants,
  };
}
