import { scrapeProduct } from "../../scrapers/index.js";
import { supabase } from "../../supabaseClient.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Health check endpoint (for testing)
    return res.status(200).json({ message: "Scraper API is working!" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    const product = await scrapeProduct(url);
    product.last_updated = new Date().toISOString();

    // Upsert into Supabase
    const { data, error } = await supabase.from("products").upsert(product, {
      onConflict: ["url"],
    });

    if (error) throw error;

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Scraping failed:", err);
    res.status(500).json({ error: err.message });
  }
}
