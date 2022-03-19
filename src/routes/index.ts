import express from 'express'
import { truyenController } from '../controllers';
import { updateCover } from '../utils/bot';
const router = express.Router();

router
  .route('/page/:pageNumber')
  .get(truyenController.getTruyensByPage);

// router
//   .route('/update')
//   .get((_req, res) => {
//     updateCover();
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
  .get(truyenController.getChapter)

export default router;
