import { Request, Response } from 'express';
import { TruyenModel } from '../models';
import { imageUrlToBase64, queryTitleToObjs, slugToObj, updateTruyen } from '../utils';

const truyenPerPage = 8;

let updating: Array<string> = [];

const truyenController = {
  getTruyensByPage: async (req: Request, res: Response) => {
    let { pageNumber } = req.params;
    const truyens = await TruyenModel.find({})
      .skip(
        truyenPerPage *
        (Number(pageNumber) - 1 >= 1 ? Number(pageNumber) - 1 : 0)
      )
      .limit(truyenPerPage)
      .select('url slug title cover');
    res.json(truyens);
  },

  getTruyen: async (req: Request, res: Response) => {
    const { slug } = req.params;
    const truyen = await TruyenModel.findOne({ slug }).select(
      '-chapters.images'
    );
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
      if (truyen.updatedAt) {
        const millisecondsDiff = (new Date()).getTime() - truyen.updatedAt.getTime();
        const millisecondsInADay = 86400000;
        if (millisecondsDiff < millisecondsInADay) {
          return;
        }
      }
      if (updating.includes(truyen._id.toString())) {
        return;
      }
      updating.push(truyen._id.toString());
      if (await updateTruyen(truyen)) {
        await truyen.save();
        updating = updating.filter((id) => id !== truyen._id.toString());
      }
    }
  },

  timKiemTruyen: async (req: Request, res: Response) => {
    const { title } = req.query;
    try {
      if (title) {
        const resultList = await queryTitleToObjs({ title } as { title: string });
        res.json(resultList);
      } else {
        throw new Error('Khong co title');
      }
    } catch (e) {
      console.log(e);
      res.json([]);
    }
  },

  getChapter: async (req: Request, res: Response) => {
    const { slug, chapNumber } = req.params;
    const truyen = await TruyenModel.findOne({ slug }).select('chapters');
    const targetChapter = truyen?.chapters?.find(
      (chapter) => chapter.chapNumber === Number(chapNumber)
    );
    if (targetChapter?.images) {
      targetChapter.images = await Promise.all(
        targetChapter?.images.map(
          async (image) =>
            `data:image/jpg;base64,${await imageUrlToBase64(image)}`
        )
      );
    }
    res.json(targetChapter || {});
  },

  getCount: async (_req: Request, res: Response) => {
    const result = await TruyenModel.estimatedDocumentCount();
    res.json({
      total: Math.ceil(result / truyenPerPage),
    });
  },
};

export { truyenController };
