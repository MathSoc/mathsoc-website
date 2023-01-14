import { Request, Response } from 'express';

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

import routes from './server/routes';
import authRoutes from "./server/routes/auth";
import api from './server/api';

dotenv.config(); // load .env variables

// hi

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');

app.locals.basedir = path.join(__dirname, '');

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .use(routes)
  .use('/api', api)
  //Auth Middleware ...
  .use(authRoutes)
  .use((req: Request, res: Response) => {
    res.status(404).render("pages/error");
  })

app.listen(port, () => console.log('Application live on localhost:3000'));


