import axios from "axios";
import * as cheerio from "cheerio";
import { fetchPage } from "../helpers/fetchpage.js";

export async function scrapeMothercare(url) {
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

  const priceText = $("span.new-price.mc-regular").first().text().trim();
  console.log("Raw price text:", priceText);

  let price = null;
  if (priceText) {
    const numeric = priceText.replace(/[₹,\s]/g, ""); // e.g. "₹559" → "559"
    price = parseFloat(numeric);
  }


  const main_image =
    $("meta[property='og:image']").attr("content") ||
    $("img.pdp-image").first().attr("src");

  const description =
    $("div.pdp-product-description-content").text().trim() ||
    $("meta[name='description']").attr("content");

  return {
    name,
    price,
    description,
    main_image,
    url,
  };
}
