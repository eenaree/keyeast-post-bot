import * as Cheerio from 'cheerio';

export type Posts = Map<number, { title: string; link: string }>;

const keyword: string = '';
const memberNo: number = 123456;

export function crawl() {
  try {
    const posts = scrapePage(keyword, memberNo);
    return posts;
  } catch (error) {
    Logger.log(error);
    throw new Error('포스트 페이지를 스크랩하는 도중 에러가 발생했습니다.');
  }
}

function scrapePage(keyword: string, memberNo: number) {
  const content = getContent_(getPageUrl(keyword, memberNo));
  const $ = Cheerio.load(content);
  const feedElems = $('ul.lst_feed').children();
  const posts: Posts = new Map();
  feedElems.each((i, elem) => {
    const volumeno = +elem.attribs.volumeno;
    const title = $(elem).find('.tit_feed').text().split('\t').join('').trim();
    const href = $(elem).find('a.link_end').attr('href');
    if (href) {
      posts.set(volumeno, {
        title,
        link: 'https://post.naver.com' + href.slice(0, href.indexOf('&searchKeyword')),
      });
    }
  });

  return posts;
}

function getContent_(url: string) {
  return UrlFetchApp.fetch(url).getContentText();
}

function getPageUrl(keyword: string, memberNo: number) {
  return `https://post.naver.com/search/authorPost.naver?keyword=${encodeURIComponent(
    keyword
  )}&memberNo=${memberNo}&sortType=createDate.dsc`;
}
