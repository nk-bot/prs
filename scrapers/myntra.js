import axios from "axios";

// Extract Product ID
function extractProductId(url) {
  const match = url.match(/\/(\d+)(?:\/buy)?$/);
  return match ? match[1] : null;
}

// Fetch Myntra Product Details using Myntra’s own API
export async function scrapeMyntra(url) {
  const productId = extractProductId(url);
  if (!productId) throw new Error("Invalid Myntra URL — product ID not found");

  const apiUrl = `https://www.myntra.com/gateway/v2/product/${productId}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const response = await axios.get(apiUrl, { headers });
  const data = response.data?.data?.product;

  if (!data) throw new Error("Product data not found from Myntra API");

  // Map relevant fields
  return {
    name: data.name,
    price: data.price?.discounted || data.price?.mrp,
    description: data.productDescriptors?.description,
    availability: data.inventoryInfo?.inventory > 0 ? "In Stock" : "Out of Stock",
    main_image: data.media?.albums?.[0]?.images?.[0]?.imageURL,
    additional_images:
      data.media?.albums?.flatMap((album) =>
        album.images.map((img) => img.imageURL)
      ) || [],
    variants: data.styleOptions?.map((opt) => opt.value) || [],
  };
}
