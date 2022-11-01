import * as puppeteer from "puppeteer";
import * as fs from "fs";

/**
 * Add usernames here
 */
const USERNAMES = ["noahbuscher"];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const scrapeResults: any = {};

  console.info(`Running for ${USERNAMES.length} user(s)`);

  for (const account of USERNAMES) {
    console.info(`Retrieving data for @${account}...`);

    try {
      await page.goto(`https://instagram.com/${account}`);

      await page.waitForXPath("//div[contains(text(), 'followers')]");
      const [followerCountElem] = await page.$x(
        '//div[contains(text(), "followers")]'
      );

      await page.waitForXPath("//img[contains(@alt, 'profile picture')]");
      const [pfpElem] = await page.$x(
        "//img[contains(@alt, 'profile picture')]"
      );

      const followerCount = await page.evaluate(
        (el) => el.textContent.split(" ")[0].replace(",", ""),
        followerCountElem
      );

      const pfp = await page.evaluate(
        // @ts-ignore
        (el) => el.getAttribute("src"),
        pfpElem
      );

      scrapeResults[account] = {
        followers: followerCount,
        image: pfp,
      };
    } catch (e) {
      console.warn(`Failed to retrieve data for @${account}`, e);
    }
  }

  try {
    console.info("Exporting results...");
    fs.writeFileSync("data.json", JSON.stringify(scrapeResults, null, 2));
  } catch (e) {
    console.warn("Failed to write file", e);
  }

  await browser.close();
})();
