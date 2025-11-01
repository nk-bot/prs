import { scrapeAmazon } from "./amazon.js";
import { scrapeFirstCry } from "./firstcry.js";
import { scrapeMothercare } from "./mothercare.js";
import { scrapeMyntra } from "./myntra.js";

export async function scrapeProduct(url) {
  if (url.includes("amazon")) return await scrapeAmazon(url);
  if (url.includes("firstcry")) return await scrapeFirstCry(url);
  if (url.includes("mothercare")) return await scrapeMothercare(url);
  if (url.includes("myntra")) return await scrapeMyntra(url);
  throw new Error("Unsupported site");
}