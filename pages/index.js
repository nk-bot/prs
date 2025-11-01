import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setProduct(data.product);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Product Scraper</h2>
      <input
        type="text"
        placeholder="Enter product URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "400px", marginRight: 10 }}
      />
      <button onClick={handleScrape} disabled={loading}>
        {loading ? "Fetching..." : "Scrape Product"}
      </button>

      {product && (
        <div style={{ marginTop: 30 }}>
          <h3>{product.name}</h3>
          <p><strong>Price:</strong> {product.price}</p>
          <p><strong>Availability:</strong> {product.availability}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <img src={product.main_image} alt={product.name} width="200" />
        </div>
      )}
    </div>
  );
}