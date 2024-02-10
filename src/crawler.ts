import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export type Post = {
  title: string;
  link: string;
  volumeno: number;
};

const pageUrl =
  'https://post.naver.com/search/authorPost.naver?keyword=%EB%AC%B8%EA%B0%80%EC%98%81&memberNo=29770009&sortType=createDate.dsc&navigationType=current';

export async function crawl() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const posts: Post[] = [];

  try {
    await page.goto(pageUrl);
    await page.setViewport({ width: 1920, height: 1080 });
  } catch (error) {
    throw new Error('failed to load the page');
  }

  try {
    const content = await page.content();
    const $ = cheerio.load(content);
    const feedElems = $('ul.lst_feed').children();
    feedElems.each((i, elem) => {
      for (const attr of elem.attributes) {
        if (attr.name === 'volumeno') {
          const volumeno = +attr.value;
          const title = $(elem).find('.tit_feed').text().split('\t').join('').trim();
          let href = $(elem).find('a.link_end').attr('href');
          if (href) {
            href = href.slice(0, href.indexOf('&searchKeyword'));
            posts.push({ volumeno, title, link: 'https://post.naver.com' + href });
          }
        }
      }
    });
  } catch (error) {
    throw new Error('failed to extract posts from the page');
  } finally {
    await page.close();
    await browser.close();
  }

  return posts;
}
