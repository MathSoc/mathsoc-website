import { Request, Response } from "express";
import express from "express";
import path from "path";
import fileUpload from "express-fileupload";
import fs from "fs";
import "dotenv/config";

import publicRoutes from "./server/routes/public-routes";
import authenticatedRoutes from "./server/routes/authenticated-routes";
import adfsRoutes from "./server/auth/adfs";
import adminRoutes from "./server/routes/admin-routes";
import api from "./server/api";
import { Logger, loggerMiddleware } from "./server/util/logger";
import { DirectoryPrebuilder } from "./server/util/directory-prebuilder";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";

const logger = new Logger();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");

app.locals.basedir = path.join(__dirname, "");

DirectoryPrebuilder.prebuild();

app
  .use(
    session({
      secret: process.env.EXPRESS_SESSION_SECRET ?? "",
      resave: false,
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // Optionally add secure: true if https,
      saveUninitialized: true,
    })
  )
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(passport.initialize())
  .use(passport.session())
  .use(
    fileUpload({
      safeFileNames: true,
      preserveExtension: 4, // jpeg is longest we can use
    })
  )
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .use(loggerMiddleware(logger))
  .use(publicRoutes)
  .use(adfsRoutes)
  .use("/api", api)
  // @todo General student authentication
  .use(authenticatedRoutes)
  // @todo Admin authentication
  .use(adminRoutes)
  .use((req: Request, res: Response) => {
    res.status(404).redirect("/error");
  });

app.listen(port, () => {
  console.info(
    `\n=========================\nlive on localhost:${port} 🚀\n=========================\n` +
      fs.readFileSync("logo.txt", "utf-8")
  );
});
