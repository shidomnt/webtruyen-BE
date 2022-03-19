"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const bot_1 = require("../utils/bot");
const router = express_1.default.Router();
router
    .route('/page/:pageNumber')
    .get(controllers_1.truyenController.getTruyensByPage);
router
    .route('/start')
    .get((_req, res) => {
    (0, bot_1.start)();
    res.send("OK");
});
router
    .route('/count')
    .get(controllers_1.truyenController.getCount);
router
    .route('/truyen-tranh/:slug')
    .get(controllers_1.truyenController.getTruyen);
router
    .route('/truyen-tranh/:slug/:chapNumber')
    .get(controllers_1.truyenController.getChapter);
exports.default = router;
