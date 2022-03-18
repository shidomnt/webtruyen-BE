import express from 'express'
import path from 'path'
import cors from 'cors'
import * as db from './config/db'
import routes from './routes'

const PORT = 4000;

const app = express();
app.use(express.static(path.join(__dirname, "../public")));

app.use(cors({
  origin: '*'
}));

// db.connect((e) => {
//   if (e) {
//     console.log("Loi khi ket noi Db");
//   } else {
//     console.log("Ket noi Db thanh cong!");
//   }
// });

app.use(routes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
