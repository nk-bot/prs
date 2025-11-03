import axios from "axios";

function extractProductId(url) {
  // Works for .../1234567/buy, .../1234567, or .../buy/1234567
  const match = url.match(/\/(\d{5,10})(?:\/|$)/);
  return match ? match[1] : null;
}

export async function scrapeMyntra(url) {
  const productId = extractProductId(url);
  if (!productId) throw new Error("❌ Invalid Myntra URL — product ID not found");

  const apiUrl = `https://www.myntra.com/gateway/v2/product/${productId}`;
  console.log("🟢 Fetching:", apiUrl);

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const response = await axios.get(apiUrl, { headers });

  // Try all possible response shapes
  const data =
    response.data?.data?.product ||
    response.data?.data?.productDetails ||
    response.data?.style ||
    response.data?.data ||
    response.data;

  if (!data) throw new Error("⚠️ Product data not found from Myntra API");

  // Extract key fields
  return {
    name: data.name,
    brand: data.brand?.name,
    mrp: data.mrp,
    discounted_price:
      data.sizes?.[0]?.sizeSellerData?.[0]?.discountedPrice || data.mrp,
    description:
      data.productDetails?.[0]?.description ||
      data.descriptors?.[0]?.description,
    countryOfOrigin: data.countryOfOrigin,
    availability: data.flags?.outOfStock ? "Out of Stock" : "In Stock",
    main_image: data.media?.albums?.[0]?.images?.[0]?.imageURL,
    all_images:
      data.media?.albums
        ?.flatMap((album) => album.images.map((img) => img.imageURL))
        ?.filter(Boolean) || [],
    sizes: data.sizes?.map((s) => ({
      label: s.label,
      available: s.available,
      price:
        s.sizeSellerData?.[0]?.discountedPrice ||
        s.sizeSellerData?.[0]?.mrp ||
        data.mrp,
    })),
    offers: data.offers?.map((o) => ({
      title: o.title,
      description: o.description,
    })),
  };
}
