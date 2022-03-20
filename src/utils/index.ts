import axios from 'axios';
import cheerioModule from 'cheerio';
import { Truyen, Chapter, Url, TruyenModel } from '../models';

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
  const slug = url.split('/').pop();
  const truyenInDb = await TruyenModel.findOne({ slug });
  if (truyenInDb) {
    return truyenInDb.toObject();
  }
  const html = await urlToDoc(url);
  const $ = cheerioModule.load(html);
  const title = $(selector.title).text();
  const author = $(selector.author).text();
  const otherName = $(selector.othername).text().split(' ; ');
  const status = $(selector.status).text();
  const kind = $(selector.kind).text().split('\n')[0].split(' - ');
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

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g," ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
  return str.toLowerCase().split(' ').join('');
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

export { getTruyen, urlToObj, slugToObj, selector, urlToDoc, imageUrlToBase64, removeVietnameseTones };
