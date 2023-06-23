import passport from "passport";

export const setUpPassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
  });
};
