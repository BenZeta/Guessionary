import express from 'express';
import router from './routers';
import cors from 'cors';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
