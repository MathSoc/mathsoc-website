import passport from "passport";
import { IProfile, OIDCStrategy, VerifyCallback } from "passport-azure-ad";
import express, { NextFunction, Request, Response } from "express";

import "express-session";
declare module "express-session" {
  interface SessionData {
    user: string;
    passport: any;
  }
}

const router = express.Router();

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `${process.env.ADFS_SERVER}/adfs/.well-known/openid-configuration`,
      clientID: process.env.ADFS_CLIENT_ID ?? "",
      responseType: "id_token",
      responseMode: "form_post",
      redirectUrl: process.env.REDIRECT_URI ?? "",
      passReqToCallback: true,
      useCookieInsteadOfSession: true,
      cookieEncryptionKeys: [
        {
          key: process.env.COOKIE_ENCRYPTION_KEY ?? "",
          iv: process.env.COOKIE_ENCRYPTION_IV ?? "",
        },
      ],
    },
    (_req: Request, profile: IProfile, done: VerifyCallback) => {
      const username = profile._json.winaccountname;
      if (!username) {
        return done(new Error("No username found"), null);
      }
      return done(null, { username: username });
    }
  )
);

const regenerateSessionAfterAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const passportInstance = req.session.passport;
  return req.session.regenerate(function (err) {
    if (err) {
      return next(err);
    }
    req.session.passport = passportInstance;
    return req.session.save(next);
  });
};

export const adfsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user) {
    next();
  } else {
    res.redirect(`/authorize/login`);
  }
};

passport.serializeUser((user, done) => {
  // You can do some stuff here
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // Also here
  done(null, user as Express.User);
});

router.get(
  "/authorize/login",
  passport.authenticate("azuread-openidconnect", {
    prompt: "login",
    successRedirect: `${process.env.REDIRECT_URI}`,
  })
);

router.post(
  "/authorize/callback",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: process.env.POST_LOGOUT_REDIRECT_URI,
    prompt: "login",
  }),
  regenerateSessionAfterAuthentication,
  (_req: Request, res: Response) =>
    res.redirect(process.env.REDIRECT_URI ?? "/auth-redirect")
);

export default router;
