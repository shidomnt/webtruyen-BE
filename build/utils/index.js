"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTitleToObjs = exports.removeVietnameseTones = exports.imageUrlToBase64 = exports.urlToDoc = exports.selector = exports.slugToObj = exports.urlToObj = exports.getTruyen = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const models_1 = require("../models");
function getTruyen(pageUrl, fn) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield urlToDoc(pageUrl);
        const $ = cheerio_1.default.load(html);
        const listItem = $('#ctl00_divCenter > div.Module.Module-170 > div > div.items > div > div.item');
        try {
            for (var listItem_1 = __asyncValues(listItem), listItem_1_1; listItem_1_1 = yield listItem_1.next(), !listItem_1_1.done;) {
                const e = listItem_1_1.value;
                const image = cheerio_1.default.load(e);
                const urlTruyen = image('a').attr('href');
                if (urlTruyen) {
                    const obj = yield urlToObj(urlTruyen);
                    if (fn) {
                        yield fn(obj);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listItem_1_1 && !listItem_1_1.done && (_a = listItem_1.return)) yield _a.call(listItem_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.getTruyen = getTruyen;
function queryTitleToObjs({ title }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`http://www.nettruyenmoi.com/Comic/Services/SuggestSearch.ashx?q=${title}`);
            const $ = cheerio_1.default.load(response.data);
            const liElements = $('ul > li');
            if (!liElements) {
                return [];
            }
            const resultObjs = Array.from(liElements).map((element) => {
                const liElement = cheerio_1.default.load(element);
                const title = liElement('h3').text();
                const slug = liElement('a').attr('href').split('/').pop();
                const cover = liElement('img').attr('src');
                const result = {
                    title,
                    slug,
                    cover,
                };
                return result;
            });
            return resultObjs;
        }
        catch (e) {
            console.log(e);
            return [];
        }
    });
}
exports.queryTitleToObjs = queryTitleToObjs;
function urlToDoc(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url, {
            responseType: 'document',
            headers: {
                Referer: 'https://www.nettruyengo.com',
                Connection: 'keep-alive',
            },
        });
        return response.data;
    });
}
exports.urlToDoc = urlToDoc;
function urlToObj(url, beforeDownloadChapters) {
    return __awaiter(this, void 0, void 0, function* () {
        const slug = url.split('/').pop();
        const truyenInDb = yield models_1.TruyenModel.findOne({ slug });
        if (truyenInDb) {
            return truyenInDb.toObject();
        }
        const html = yield urlToDoc(url);
        const $ = cheerio_1.default.load(html);
        const title = $(selector.title).text();
        const author = $(selector.author).text();
        const otherName = $(selector.othername).text().split(' ; ');
        const status = $(selector.status).text();
        const kind = $(selector.kind).text().split('\n')[0].split(' - ');
        const cover = `http:${$(selector.cover).attr('src')}`;
        const detail = $(selector.detail).text();
        if (beforeDownloadChapters) {
            const truyenWithoutChapters = {
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
            yield beforeDownloadChapters(truyenWithoutChapters);
        }
        const chapterElements = $(selector.chapter);
        const chapters = yield getChapters(chapterElements);
        const truyen = {
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
    });
}
exports.urlToObj = urlToObj;
function slugToObj(slug, beforeDownloadChapters) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `http://www.nettruyenmoi.com/truyen-tranh/${slug}`;
        return yield urlToObj(url, beforeDownloadChapters);
    });
}
exports.slugToObj = slugToObj;
function imageUrlToBase64(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getBase64(url);
    });
}
exports.imageUrlToBase64 = imageUrlToBase64;
function getBase64(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get(url, {
            responseType: 'arraybuffer',
            headers: {
                Referer: 'http://www.nettruyengo.com/',
                Connection: 'keep-alive',
            },
        });
        return Buffer.from(response.data, 'binary').toString('base64');
    });
}
function getChapters(chapterElements) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = [];
        for (const element of chapterElements) {
            const chapter = cheerio_1.default.load(element);
            const chapNumber = Number(chapter('.chapter > a').text().split(' ')[1].split(':')[0]);
            const url = chapter('.chapter > a').attr('href');
            const images = yield getImages(url);
            result.push({ chapNumber, url, images });
        }
        return result.sort((a, b) => a.chapNumber - b.chapNumber);
    });
}
function getImages(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const html = yield urlToDoc(url);
        const $ = cheerio_1.default.load(html);
        const chapterElement = $(selector.chapterPage);
        const result = [];
        for (const element of chapterElement) {
            const chapterPage = cheerio_1.default.load(element);
            const urlRaw = chapterPage('img').attr('src');
            const url = `http:${urlRaw}`;
            result.push(url);
        }
        return result;
    });
}
function removeVietnameseTones(str) {
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
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
    str = str.replace(/\u02C6|\u0306|\u031B/g, '');
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
    return str.toLowerCase().split(' ').join('');
}
exports.removeVietnameseTones = removeVietnameseTones;
const selector = {
    title: '#item-detail > h1',
    author: '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.author.row > p.col-xs-8',
    othername: '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.othername.row > h2',
    status: '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.status.row > p.col-xs-8',
    detail: '.detail-content > p:nth-child(2)',
    kind: '#item-detail > div.detail-info > div > div.col-xs-8.col-info > ul > li.kind.row > p.col-xs-8',
    chapter: '#nt_listchapter > nav > ul > li.row:not(li.heading)',
    chapterPage: '.page-chapter',
    cover: '#item-detail > div.detail-info > div > div.col-xs-4.col-image > img',
};
exports.selector = selector;
