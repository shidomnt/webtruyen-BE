import axios from 'axios';
import cheerioModule from 'cheerio';
import { Truyen, Chapter, Url } from '../models';

async function getTruyen(pageUrl: Url, fn?: (obj: Truyen) => any) {
  const html = await urlToDoc(pageUrl);
  const $ = cheerioModule.load(html);
  const listItem = $(
    '#ctl00_divCenter > div.Module.Module-170 > div > div.items > div > div.item'
  );
  for await (const e of listItem) {
    const image = cheerioModule.load(e);
    const urlTruyen = image('a').attr('href');
    if (urlTruyen) {
      const obj = await urlToObj(urlTruyen);
      if (fn) {
        await fn(obj);
      }
    }
  }
}

async function urlToDoc(url: string): Promise<string> {
  const response = await axios.get<string>(url, {
    responseType: 'document',
    headers: {
      Referer: 'https://www.nettruyengo.com',
      Connection: 'keep-alive',
    },
  });
  return response.data;
}

async function urlToObj(
  url: string,
  beforeDownloadChapters?: (
    truyenPartial: Omit<Truyen, 'chapters'>
  ) => void | Promise<void>
): Promise<Truyen> {
  const html = await urlToDoc(url);
  const $ = cheerioModule.load(html);
  const title = $(selector.title).text();
  const author = $(selector.author).text();
  const otherName = $(selector.othername).text().split(' ; ');
  const status = $(selector.status).text();
  const kind = $(selector.kind).text().split('\n')[0].split(' - ');
  const slug = url.split('/').pop();
  const cover = `http:${$(selector.cover).attr('src')!}`;
  const detail = $(selector.detail).text();
  if (beforeDownloadChapters) {
    await beforeDownloadChapters({
      url,
      title,
      author,
      otherName,
      status,
      kind,
      slug,
      detail,
      cover,
    });
  }
  const chapterElements = $(selector.chapter);
  const chapters = await getChapters(chapterElements);
  return {
    url,
    title,
    author,
    otherName,
    status,
    kind,
    slug,
    detail,
    cover,
    chapters,
  };
}

async function slugToObj(
  slug: string,
  beforeDownloadChapters?: (
    truyenPartial: Omit<Truyen, 'chapters'>
  ) => void | Promise<void>
): Promise<Truyen> {
  const url = `http://www.nettruyenmoi.com/truyen-tranh/${slug}`;
  return await urlToObj(url, beforeDownloadChapters);
}

async function imageUrlToBase64(url: Url) {
  return await getBase64(url);
}

async function getBase64(url: Url): Promise<string> {
  const response = await axios
    .get(url, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'http://www.nettruyengo.com/',
        'Connection': 'keep-alive'
      }
    });
  return Buffer.from(response.data, 'binary').toString('base64');
}

async function getChapters(
  chapterElements: cheerio.Cheerio
): Promise<Array<Chapter>> {
  const result: Array<Chapter> = [];
  for (const element of chapterElements) {
    const chapter = cheerioModule.load(element);
    const chapNumber = Number(
      chapter('.chapter > a').text().split(' ')[1].split(':')[0]
    );
    const url = chapter('.chapter > a').attr('href')!;
    const images = await getImages(url);
    result.push({ chapNumber, url, images });
  }
  return result.sort((a, b) => a.chapNumber - b.chapNumber);
}

async function getImages(url: string): Promise<Array<Url>> {
  const html = await urlToDoc(url);
  const $ = cheerioModule.load(html);
  const chapterElement = $(selector.chapterPage);
  const result: Array<Url> = [];
  for (const element of chapterElement) {
    const chapterPage = cheerioModule.load(element);
    const urlRaw = chapterPage('img').attr('src')!;
    const url = `http:${urlRaw}`;
    result.push(url);
  }
  return result;
}

const selector = {
  title: '#item-detail > h1',
  author:
    '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.author.row > p.col-xs-8',
  othername:
    '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.othername.row > h2',
  status:
    '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.status.row > p.col-xs-8',
  detail: '.detail-content > p:nth-child(2)',
  kind: '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.kind.row > p.col-xs-8',
  chapter: '#nt_listchapter > nav > ul > li.row:not(li.heading)',
  chapterPage: '.page-chapter',
  cover: '#item-detail > div.detail-info > div > div.col-xs-4.col-image > img',
};

export { getTruyen, urlToObj, slugToObj, selector, urlToDoc, imageUrlToBase64 };
