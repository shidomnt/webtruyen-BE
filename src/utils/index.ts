import axios from 'axios';
import cheerioModule from 'cheerio';
import { Truyen, Chapter, Url, TruyenModel } from '../models';

interface SearchResult {
  title: string;
  slug: string;
  cover: Url;
}

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

async function queryTitleToObjs({ title }: { title: string }) {
  try {
    const response = await axios.get<string>(
      `http://www.nettruyenmoi.com/Comic/Services/SuggestSearch.ashx?q=${title}`
    );
    const $ = cheerioModule.load(response.data);
    const liElements = $('ul > li');
    if (!liElements) {
      return [];
    }
    const resultObjs = Array.from(liElements).map((element) => {
      const liElement = cheerioModule.load(element);
      const title = liElement('h3').text();
      const slug = liElement('a').attr('href')!.split('/').pop()!;
      const cover = liElement('img').attr('src')!;
      const result: SearchResult = {
        title,
        slug,
        cover,
      };
      return result;
    });
    return resultObjs;
  } catch (e) {
    console.log(e);
    return [];
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
    const truyenWithoutChapters: Omit<Truyen, 'chapters'> = {
      url,
      title,
      author,
      otherName,
      status,
      kind,
      slug,
      detail,
      cover,
    };
    await beforeDownloadChapters(truyenWithoutChapters);
  }
  const chapterElements = $(selector.chapter);
  const chapters = await getChapters(chapterElements);
  const truyen: Truyen = {
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
  return truyen;
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
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      Referer: 'http://www.nettruyengo.com/',
      Connection: 'keep-alive',
    },
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

async function updateTruyen(truyen: Truyen) {
  const { url } = truyen;
  const html = await urlToDoc(url);
  const $ = cheerioModule.load(html);
  const chapterElements = $(selector.chapter);
  if (chapterElements.length === truyen.chapters.length) {
    return false;
  }
  const chapters = await getChapters(chapterElements);
  truyen.chapters = chapters;
  return true;
}

function removeVietnameseTones(str: string) {
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'a');
  str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'e');
  str = str.replace(/??|??|???|???|??/g, 'i');
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'o');
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'u');
  str = str.replace(/???|??|???|???|???/g, 'y');
  str = str.replace(/??/g, 'd');
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'A');
  str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, 'E');
  str = str.replace(/??|??|???|???|??/g, 'I');
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, 'O');
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, 'U');
  str = str.replace(/???|??|???|???|???/g, 'Y');
  str = str.replace(/??/g, 'D');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // M???t v??i b??? encode coi c??c d???u m??, d???u ch??? nh?? m???t k?? t??? ri??ng bi???t n??n th??m hai d??ng n??y
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ?? ?? ?? ?? ??  huy???n, s???c, ng??, h???i, n???ng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ?? ?? ??  ??, ??, ??, ??, ??
  // Remove extra spaces
  // B??? c??c kho???ng tr???ng li???n nhau
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  // Remove punctuations
  // B??? d???u c??u, k?? t??? ?????c bi???t
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' '
  );
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

export {
  getTruyen,
  urlToObj,
  slugToObj,
  selector,
  urlToDoc,
  imageUrlToBase64,
  removeVietnameseTones,
  queryTitleToObjs,
  updateTruyen
};
