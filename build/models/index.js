"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruyenModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const SchemaChapter = new Schema({
    chapNumber: Number,
    url: String,
    images: [String]
});
const SchemaTruyen = new Schema({
    url: String,
    title: String,
    otherName: [String],
    author: String,
    status: String,
    kind: [String],
    slug: String,
    cover: String,
    detail: String,
    chapters: [SchemaChapter]
});
const TruyenModel = mongoose_1.default.model('Truyen', SchemaTruyen);
exports.TruyenModel = TruyenModel;
