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
Object.defineProperty(exports, "__esModule", { value: true });
exports.truyenController = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const truyenPerPage = 8;
const truyenController = {
    getTruyensByPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { pageNumber } = req.params;
        const truyens = yield models_1.TruyenModel.find({})
            .skip(truyenPerPage *
            (Number(pageNumber) - 1 >= 1 ? Number(pageNumber) - 1 : 0))
            .limit(truyenPerPage)
            .select('url slug title cover');
        res.json(truyens);
    }),
    getTruyen: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { slug } = req.params;
        const truyen = yield models_1.TruyenModel.findOne({ slug }).select('-chapters.images');
        if (!truyen) {
            const newTruyen = new models_1.TruyenModel(yield (0, utils_1.slugToObj)(slug, (truyenPartial) => __awaiter(void 0, void 0, void 0, function* () {
                const truyenPart = new models_1.TruyenModel(truyenPartial);
                yield truyenPart.save();
                res.json(truyenPartial);
            })));
            yield models_1.TruyenModel.findOneAndUpdate({ slug }, { chapters: newTruyen.chapters });
        }
        else {
            res.json(truyen);
        }
    }),
    timKiemTruyen: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { title } = req.query;
        try {
            if (title) {
                const resultList = yield (0, utils_1.queryTitleToObjs)({ title });
                res.json(resultList);
            }
            else {
                throw new Error('Khong co title');
            }
        }
        catch (e) {
            console.log(e);
            res.json([]);
        }
    }),
    getChapter: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { slug, chapNumber } = req.params;
        const truyen = yield models_1.TruyenModel.findOne({ slug }).select('chapters');
        const targetChapter = (_a = truyen === null || truyen === void 0 ? void 0 : truyen.chapters) === null || _a === void 0 ? void 0 : _a.find((chapter) => chapter.chapNumber === Number(chapNumber));
        if (targetChapter === null || targetChapter === void 0 ? void 0 : targetChapter.images) {
            targetChapter.images = yield Promise.all(targetChapter === null || targetChapter === void 0 ? void 0 : targetChapter.images.map((image) => __awaiter(void 0, void 0, void 0, function* () { return `data:image/jpg;base64,${yield (0, utils_1.imageUrlToBase64)(image)}`; })));
        }
        res.json(targetChapter || {});
    }),
    getCount: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield models_1.TruyenModel.estimatedDocumentCount();
        res.json({
            total: Math.ceil(result / truyenPerPage),
        });
    }),
};
exports.truyenController = truyenController;
