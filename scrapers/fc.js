import axios from "axios";

export async function scrapeFirstCry(url) {
  const productId = url.match(/\/(\d+)\/product-detail/)?.[1];
  if (!productId) return null;

  const apiUrl = `https://api.firstcry.com/product/getproductdetails?productid=${productId}`;
  const { data } = await axios.get(apiUrl);

  if (!data?.product) return null;

  const product = data.product;
  const price = product.discountedprice || product.price || null;
  const name = product.productname || null;
  const image = product.productimage || null;
  const description = product.longdescription || product.shortdescription || "";

  return { name, price, image, description, url, site: "FirstCry" };
}
