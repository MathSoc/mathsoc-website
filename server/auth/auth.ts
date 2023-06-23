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
      callbackURL:
        "https://staging9000.mathsoc.uwaterloo.ca/auth-redirect/google",
      scope: ["profile"],
    },
    (_accessToken, _refreshToken, profile, done: VerifyCallback) => {
      const username = profile.id;
      if (!username) {
        return done(new Error("No username found"), null);
      }
      return done(null, { username: username ?? "john" });
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

/**
 * Middleware to be used on low-authentication routes, including the exam bank
 */
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

/**
 * Middleware to be used on high-authentication routes, including the admin backend
 */
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

/**
 * needed for passport
 */
passport.serializeUser((user, done) => {
  done(null, user);
});

/**
 * needed for passport
 */
passport.deserializeUser((user, done) => {
  done(null, user as Express.User);
});

/**
 * ADFS:
 * For an unauthenticated general user, this redirects them to Waterloo's ADFS SSO system
 */
router.get(
  "/authorize/student-login",
  passport.authenticate("azuread-openidconnect", {
    prompt: "login",
    successRedirect: `${tokens.REDIRECT_URI}`,
  })
);

/**
 * Google:
 * For an unauthenticated user trying to access admin, this redirects them to Google's SSO
 */
router.get(
  "/authorize/admin-login",
  passport.authenticate("google", {
    prompt: "login",
    successRedirect: `/auth-redirect/google`,
  })
);

/**
 * ADFS:
 * When a user successfully logs in with ADFS, a POST request is made to this endpoint, with the data
 * needed by passport to confirm authentication in the request body.  On success, we send them to /auth-redirect 
 */
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

/**
 * Google:
 * When a user successfully logs in with Google, a GET request is made to this endpoint, with the data
 * needed by passport to confirm authentication in the query string.  On success, we send them to /admin 
 */
router.get(
  "/auth-redirect/google",
  passport.authenticate("google", {
    failureMessage: true,
    failureRedirect: "/",
    successRedirect: "/admin", // since this is only accessible to admins, it's safe to redirect them here
  })
);

export default router;
