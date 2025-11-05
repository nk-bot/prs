import axios from "axios";
import * as cheerio from "cheerio";
import { fetchPage } from "../helpers/fetchpage.js";


export async function scrapeAmazon(url) {
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(data);

  const name = $("#productTitle").text().trim();
  const price =
    $("#priceblock_ourprice").text().trim() ||
    $(".a-price .a-offscreen").first().text().trim();
  const availability = $("#availability span").text().trim();
  const main_image = $("#imgTagWrapperId img").attr("src");
  const additional_images = [];
  $("li.image.item img").each((_, el) => {
    additional_images.push($(el).attr("src"));
  });

  const description = $("#feature-bullets ul li span").text().trim();
  const return_policy = $("#RETURNS_POLICY span").text().trim() || "Refer site";
  const variants = [];

  $("#twister .a-dropdown-container").each((_, el) => {
    const type = $(el).find(".a-form-label").text().trim();
    const options = [];
    $(el)
      .find("option")
      .each((_, o) => options.push($(o).text().trim()));
    variants.push({ type, options });
  });
  console.log("name:", name);  
  console.log("price", price);
  console.log("description :", description);
  console.log("image", main_image);

  return {
    site: "Amazon",
    url,
    name,
    price,
    availability,
    main_image,
    additional_images,
    description,
    return_policy,
    variants,
  };
}