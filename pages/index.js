import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    setLoading(true);
    setError("");
    setProduct(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch product details");
      }

      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Product Scraper</h1>
      <p>Enter an e-commerce product URL to fetch its details.</p>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "400px",
            padding: "8px",
            marginRight: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleScrape}
          disabled={loading || !url}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Fetching..." : "Scrape Product"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          ⚠️ {error}
        </p>
      )}

      {product && (
        <div
          style={{
            marginTop: "40px",
            borderTop: "1px solid #ddd",
            paddingTop: "20px",
          }}
        >
          <h2>{product.name}</h2>
          <p><strong>Price:</strong> {product.price}</p>
          <p><strong>Availability:</strong> {product.availability}</p>
          <p><strong>Description:</strong> {product.description}</p>

          {product.main_image && (
            <img
              src={product.main_image}
              alt={product.name}
              width="200"
              style={{ marginTop: "10px", borderRadius: "8px" }}
            />
          )}
        </div>
      )}
    </div>
  );
}
