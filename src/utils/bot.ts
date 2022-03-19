import { getTruyen, selector, urlToDoc } from '.';
import { Truyen, TruyenModel } from '../models';

import mongoose from 'mongoose';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import cheerioModule from 'cheerio';

const DB_ACCOUNT = 'admin';
const DB_PASSWORD = 'quangha2239';

const DB_URL = `mongodb+srv://${DB_ACCOUNT}:${DB_PASSWORD}@cluster0.z3qdj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

async function connect(callback?: (error?: Error) => any) {
  try {
    await mongoose.connect(DB_URL);
    if (callback) {
      callback();
    }
  } catch (e) {
    if (e instanceof Error) {
      if (callback) {
        callback(e);
      }
    }
  }
};

async function start() {
  // await connect(() => console.log("MongoDb Connected"));
  for (let i = 1; i < 556; i++) {
    try {
      const url = `https://www.nettruyenmoi.com/tim-truyen?page=${i}`;

      await getTruyen(url, async (obj) => {
        // const truyen = new TruyenModel(obj);
        // await truyen.save();
        const truyens = collection(db, 'truyens')
        await addDoc(truyens, obj);
        console.log(`${obj.title}: OK`);
      });
    } catch (e) {
      console.log(e);
    }
  }
}

async function updateCover() {
  const truyens = await TruyenModel.find({}).select("url cover");
  for await (const truyen of truyens) {
    if (!truyen.cover || !truyen.detail) {
      const html = await urlToDoc(truyen.url);
      const $ = cheerioModule.load(html);
      if (!truyen.cover) {
        const cover = `http:${$(selector.cover).attr('src')!}`;
        truyen.cover = cover;
        await truyen.save();
      }
      if (!truyen.detail) {
        const detail = $(selector.detail).text();
        truyen.detail = detail;
        await truyen.save();
      }
    }
  }
}

export {
  start,
  updateCover
}


