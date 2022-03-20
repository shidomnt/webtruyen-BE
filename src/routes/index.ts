import express from 'express'
import { truyenController } from '../controllers';
import { start } from '../utils/bot';
const router = express.Router();

router
  .route('/page/:pageNumber')
  .get(truyenController.getTruyensByPage);

// router
//   .route('/start')
//   .get((_req, res) => {
//     start();
//     res.send("OK")
//   })

router
  .route('/count')
  .get(truyenController.getCount);

router
  .route('/truyen-tranh/:slug')
  .get(truyenController.getTruyen);

router
  .route('/truyen-tranh/:slug/:chapNumber')
  .get(truyenController.getChapter);

router
  .route('/timkiem')
  .get(truyenController.timKiemTruyen);

export default router;
