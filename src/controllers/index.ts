import { Request, Response } from 'express';
import { TruyenModel } from '../models';
import { slugToObj } from '../utils';

const truyenPerPage = 8;

const truyenController = {
  getTruyensByPage: async (req: Request, res: Response) => {
    let { pageNumber } = req.params;
    const truyens = await TruyenModel.find({})
      .skip(truyenPerPage * (Number(pageNumber) - 1 >= 1 ? Number(pageNumber) - 1 : 0 ))
      .limit(truyenPerPage)
      .select('url slug title cover');
    res.json(truyens);
  },

  getTruyen: async (req: Request, res: Response) => {
    const { slug } = req.params;
    const truyen = await TruyenModel.findOne({ slug }).select('-chapters.images');
    if (!truyen) {
      const newTruyen = new TruyenModel(
        await slugToObj(slug, async (truyenPartial) => {
          const truyenPart = new TruyenModel(truyenPartial);
          await truyenPart.save();
          res.json(truyenPartial);
        })
      );
      await TruyenModel.findOneAndUpdate(
        { slug },
        { chapters: newTruyen.chapters }
      );
    } else {
      res.json(truyen);
    }
  },
  getChapter: async (req: Request, res: Response) => {
    const { slug, chapNumber } = req.params;
    const truyen = await TruyenModel.findOne({ slug }).select('chapters');
    const targetChapter = truyen?.chapters?.find(
      (chapter) => chapter.chapNumber === Number(chapNumber)
    );
    res.json(targetChapter || {});
  },
  getCount: async (_req: Request, res: Response) => {
    const result = await TruyenModel.estimatedDocumentCount();
    res.json({
      total: Math.ceil(result / truyenPerPage)
    });
  }
};

export { truyenController };
