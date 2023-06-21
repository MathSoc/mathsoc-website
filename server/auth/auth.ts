import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { IProfile, OIDCStrategy, VerifyCallback } from "passport-azure-ad";
import express, { NextFunction, Request, Response } from "express";
import tokens from "../../config";
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
      identityMetadata: `${tokens.ADFS_SERVER}/adfs/.well-known/openid-configuration`,
      clientID: tokens.ADFS_CLIENT_ID ?? "",
      responseType: "id_token",
      responseMode: "form_post",
      redirectUrl: tokens.REDIRECT_URI ?? "",
      passReqToCallback: true,
      useCookieInsteadOfSession: true,
      cookieEncryptionKeys: [
        {
          key: tokens.COOKIE_ENCRYPTION_KEY ?? "",
          iv: tokens.COOKIE_ENCRYPTION_IV ?? "",
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

passport.use(
  new GoogleStrategy(
    {
      clientID: tokens.GOOGLE_CLIENT_ID ?? "",
      clientSecret: tokens.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL: "https://staging9000.mathsoc.uwaterloo.ca/auth-redirect",
    },
    (_accessToken, _refreshToken, profile, done: VerifyCallback) => {
      const username = profile.id;
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

export const ADFSMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (tokens.IS_DEVELOPMENT === "true") {
    next();
    return;
  }

  if (req.user) {
    next();
  } else {
    res.redirect(`/authorize/student-login`);
  }
};

export const GoogleMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (tokens.IS_DEVELOPMENT === "true") {
    next();
    return;
  }

  if (req.user) {
    next();
  } else {
    res.redirect(`/authorize/admin-login`);
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
  "/authorize/student-login",
  passport.authenticate("azuread-openidconnect", {
    prompt: "login",
    successRedirect: `${tokens.REDIRECT_URI}`,
  })
);

router.get(
  "/authorize/admin-login",
  passport.authenticate("google", {
    prompt: "login",
    scope: ['profile'],
    successRedirect: `${tokens.REDIRECT_URI}`,
  })
);

router.post(
  "/auth-redirect",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: tokens.POST_LOGOUT_REDIRECT_URI ?? "",
    prompt: "login",
  }),
  regenerateSessionAfterAuthentication,
  (_req: Request, res: Response) =>
    res.redirect(tokens.REDIRECT_URI ?? "/auth-redirect")
);

export default router;
