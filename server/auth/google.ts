import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
  new GoogleStrategy(
    {
      clientID: tokens.GOOGLE_CLIENT_ID ?? "",
      clientSecret: tokens.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL:
        "https://staging9000.mathsoc.uwaterloo.ca/auth-redirect/google",
      scope: ["profile"],
    },
    (_accessToken, _refreshToken, profile, done) => {
      const username = profile.id;
      if (!username) {
        return done(new Error("No username found"));
      }
      return done(null, { username: username ?? "john" });
    }
  )
);

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
