import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import * as db from './config/db';
import routes from './routes';

const PORT = 4000;

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

app.use(
  cors({
    origin: '*',
  })
);

app.use(morgan('dev'));

db.connect((e) => {
  if (e) {
    console.log('Loi khi ket noi Db');
  } else {
    console.log('MongoDb Connected');
  }
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
