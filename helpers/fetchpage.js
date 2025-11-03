export async function fetchPage(url) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const response = await axios.get(url, { headers });
  console.log("Fetched URL:", url);
  console.log("Response length:", response.data.length);
  return response.data;
}
