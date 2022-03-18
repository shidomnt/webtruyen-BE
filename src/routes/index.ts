import express from 'express'
import { getDocs, collection } from 'firebase/firestore';
import { start } from '../utils/bot';
import { db } from '../config/firebase';
const router = express.Router();

const url = 'https://www.nettruyenmoi.com/tim-truyen?page=1';

router
  .route('/')
  .get(async (_req, res) => {
    await start();
    res.json("OK");
  });

export default router;
