import passport from "passport";
import { IProfile, OIDCStrategy, VerifyCallback } from "passport-azure-ad";
import express, { NextFunction, Request, Response } from "express";
import tokens from "../../config";
import "express-session";

declare module "express-session" {
  interface SessionData {
    user: string;
    passport: any;
    redirectUri: string | undefined;
  }
}

const router = express.Router();

if (tokens.IS_DEVELOPMENT !== "true") {
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
        return done(null, { username, adminAccess: false });
      }
    )
  );
}

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
    const originalUrl = req.path;
    res.redirect(
      `/authorize/student-login?next=${encodeURIComponent(originalUrl)}`
    );
  }
};

/**
 * ADFS:
 * For an unauthenticated general user, this redirects them to Waterloo's ADFS SSO system
 */
router.get(
  "/authorize/student-login",
  (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.next;

    req.session.redirectUri = redirect as string;

    console.log(req.session.redirectUri);
    passport.authenticate("azuread-openidconnect", {
      prompt: "login",
      successRedirect: tokens.REDIRECT_URI,
      failureRedirect: tokens.POST_LOGOUT_REDIRECT_URI,
    })(req, res, next);
  }
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
  (req: Request, res: Response) => {
    try {
      const redirect = req.session.redirectUri;

      if (typeof redirect === "string" && redirect.startsWith("/")) {
        req.session.redirectUri = undefined;
        res.redirect(redirect);
      } else {
        res.redirect("/");
      }
    } catch (err) {
      res.redirect("/");
    }
  }
);

export default router;
