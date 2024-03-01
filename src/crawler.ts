import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export type Post = {
  title: string;
  link: string;
  volumeno: number;
};

function getPageUrl(keyword: string) {
  return `https://post.naver.com/search/authorPost.naver?keyword=${encodeURIComponent(
    keyword
  )}&memberNo=29770009&sortType=createDate.dsc`;
}

export async function crawl() {
  const browser = await puppeteer.launch();
  const page1 = await browser.newPage();
  const posts: Post[] = [];

  try {
    await page1.goto(getPageUrl('문가영'));
    await page1.setViewport({ width: 1920, height: 1080 });
  } catch (error) {
    throw new Error('failed to load the page1');
  }

  try {
    const content = await page1.content();
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
            posts.push({ volumeno, title, link: 'https://post.naver.com' + href });
          }
        }
      }
    });
  } catch (error) {
    throw new Error('failed to extract posts from the page1');
  } finally {
    await page1.close();
  }

  const page2 = await browser.newPage();

  try {
    await page2.goto(getPageUrl('가영'));
    await page2.setViewport({ width: 1920, height: 1080 });
  } catch (error) {
    throw new Error('failed to load the page2');
  }

  try {
    const content = await page2.content();
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
            posts.push({ volumeno, title, link: 'https://post.naver.com' + href });
          }
        }
      }
    });
  } catch {
    throw new Error('failed to extract posts from the page2');
  } finally {
    await page2.close();
    await browser.close();
  }

  return posts;
}
