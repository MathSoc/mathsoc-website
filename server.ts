// CHECK ENV VARS BEFORE STARTING APP
import "./config";

import { Request, Response } from "express";
import express from "express";
import path from "path";
import fileUpload from "express-fileupload";
import fs from "fs";
import tokens from "./config";

import publicRoutes from "./server/routes/public-routes";
import authenticatedRoutes from "./server/routes/authenticated-routes";
import ADFSAuthRoutes from "./server/auth/adfs";
import GoogleAuthRoutes from "./server/auth/google";
import adminRoutes from "./server/routes/admin-routes";
import api from "./server/api";
import { Logger, loggerMiddleware } from "./server/util/logger";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import { setUpPassport } from "./server/auth/auth";

console.info("Starting server...");

const logger = new Logger();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "pug");

app.locals.basedir = path.join(__dirname, "");
setUpPassport();

app
  .use(
    session({
      secret: tokens.EXPRESS_SESSION_SECRET ?? "",
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
  .use("/assets", express.static(path.join(__dirname, "public/assets")))
  .set("views", path.join(__dirname, "views"))
  .use(loggerMiddleware(logger))
  .use(publicRoutes)
  .use(ADFSAuthRoutes)
  .use(GoogleAuthRoutes)
  .use("/api", api)
  .use(authenticatedRoutes)
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
