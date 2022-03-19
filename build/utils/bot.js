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
exports.updateCover = exports.start = void 0;
const _1 = require(".");
const models_1 = require("../models");
const mongoose_1 = __importDefault(require("mongoose"));
const cheerio_1 = __importDefault(require("cheerio"));
const DB_ACCOUNT = 'admin';
const DB_PASSWORD = 'quangha2239';
const DB_URL = `mongodb+srv://${DB_ACCOUNT}:${DB_PASSWORD}@cluster0.z3qdj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
function connect(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(DB_URL);
            if (callback) {
                callback();
            }
        }
        catch (e) {
            if (e instanceof Error) {
                if (callback) {
                    callback(e);
                }
            }
        }
    });
}
;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield connect(() => console.log("MongoDb Connected"));
        for (let i = 1; i < 556; i++) {
            try {
                const url = `https://www.nettruyenmoi.com/tim-truyen?page=${i}`;
                yield (0, _1.getTruyen)(url, (obj) => __awaiter(this, void 0, void 0, function* () {
                    const truyenInDb = yield models_1.TruyenModel.findOne({ slug: obj.slug });
                    if (!truyenInDb) {
                        const truyen = new models_1.TruyenModel(obj);
                        yield truyen.save();
                        console.log(`${obj.title}: OK`);
                    }
                }));
            }
            catch (e) {
                console.log(e);
            }
        }
    });
}
exports.start = start;
function updateCover() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const truyens = yield models_1.TruyenModel.find({}).select("url cover");
        try {
            for (var truyens_1 = __asyncValues(truyens), truyens_1_1; truyens_1_1 = yield truyens_1.next(), !truyens_1_1.done;) {
                const truyen = truyens_1_1.value;
                if (!truyen.cover || !truyen.detail) {
                    const html = yield (0, _1.urlToDoc)(truyen.url);
                    const $ = cheerio_1.default.load(html);
                    if (!truyen.cover) {
                        const cover = `http:${$(_1.selector.cover).attr('src')}`;
                        truyen.cover = cover;
                        yield truyen.save();
                    }
                    if (!truyen.detail) {
                        const detail = $(_1.selector.detail).text();
                        truyen.detail = detail;
                        yield truyen.save();
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (truyens_1_1 && !truyens_1_1.done && (_a = truyens_1.return)) yield _a.call(truyens_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.updateCover = updateCover;
