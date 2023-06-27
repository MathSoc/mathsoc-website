import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import express, { NextFunction, Request, Response } from "express";
import tokens from "../../config";
import "express-session";
import { PermissionsHandler } from "./permissions";

declare module "express-session" {
  interface SessionData {
    user: string;
    passport: any;
  }
}

const router = express.Router();

const LOGIN_URL = "/authorize/admin-login";
const REDIRECT_URL = "/auth-redirect/google";

if (tokens.IS_DEVELOPMENT !== "true") {
  passport.use(
    new GoogleStrategy(
      {
        clientID: tokens.GOOGLE_CLIENT_ID ?? "",
        clientSecret: tokens.GOOGLE_CLIENT_SECRET ?? "",
        callbackURL: tokens.GOOGLE_AUTH_SUCCESS_REDIRECT,
        scope: ["profile", "email"],
      },
      (_accessToken, _refreshToken, profile, done) => {
        const username = profile.id;
        if (!username) {
          return done(new Error("No username found"));
        }

        if (profile.emails) {
          for (const email of profile.emails) {
            if (PermissionsHandler.shouldHaveAdminRights(email.value)) {
              return done(null, { username, adminAccess: true });
            }
          }
        }

        return done(
          new Error(
            `MathSoc profile ${profile.username} is not authorized with admin permissions`
          )
        );
      }
    )
  );
}

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
  // @ts-expect-error No admin attributes are pre-defined to exist on Express.User.  This is custom.
  if (req.user?.adminAccess == true) {
    next();
  } else {
    res.redirect(LOGIN_URL);
  }
};

/**
 * Google:
 * For an unauthenticated user trying to access admin, this redirects them to Google's SSO
 */
router.get(
  LOGIN_URL,
  passport.authenticate("google", {
    prompt: "login",
    successRedirect: REDIRECT_URL,
  })
);

/**
 * Google:
 * When a user successfully logs in with Google, a GET request is made to this endpoint, with the data
 * needed by passport to confirm authentication in the query string.  On success, we send them to /admin
 */
router.get(
  REDIRECT_URL,
  passport.authenticate("google", {
    failureMessage: true,
    failureRedirect: "/",
    successRedirect: "/admin", // since this is only accessible to admins, it's safe to redirect them here
  })
);

export default router;
