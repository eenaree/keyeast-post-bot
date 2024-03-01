import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';

export type Posts = Map<number, { title: string; link: string }>;

function getPageUrl(keyword: string) {
  return `https://post.naver.com/search/authorPost.naver?keyword=${encodeURIComponent(
    keyword
  )}&memberNo=29770009&sortType=createDate.dsc`;
}

export async function crawl() {
  const browser = await puppeteer.launch();

  try {
    const [postsPage1, postsPage2] = await Promise.all([
      scrapePage(browser, '문가영'),
      scrapePage(browser, '가영'),
    ]);
    const mergedPosts = new Map([...postsPage1, ...postsPage2]);
    return mergedPosts;
  } catch (error) {
    throw new Error('failed to scrape the page');
  } finally {
    await browser.close();
  }
}

async function scrapePage(browser: Browser, keyword: string) {
  const page = await browser.newPage();
  const posts: Posts = new Map();

  try {
    await page.goto(getPageUrl(keyword));
    await page.setViewport({ width: 1920, height: 1080 });
  } catch (error) {
    throw new Error(`failed to load the page: keyword ${keyword}`);
  }

  try {
    const content = await page.content();
    const $ = cheerio.load(content);
    const feedElems = $('ul.lst_feed').children();
    feedElems.each((i, elem) => {
      if (i > 4) return;
      for (const attr of elem.attributes) {
        if (attr.name === 'volumeno') {
          const volumeno = +attr.value;
          const title = $(elem).find('.tit_feed').text().split('\t').join('').trim();
          let href = $(elem).find('a.link_end').attr('href');
          if (href) {
            href = href.slice(0, href.indexOf('&searchKeyword'));
            posts.set(volumeno, { title, link: 'https://post.naver.com' + href });
          }
        }
      }
    });
    return posts;
  } catch (error) {
    throw new Error(`failed to extract posts from the page: keyword ${keyword}`);
  } finally {
    await page.close();
  }
}
