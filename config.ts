import "dotenv/config";

// Will always prevent server initialization if this token is absent
const requiredTokens = {
  IS_DEVELOPMENT: process.env.IS_DEVELOPMENT,
};

// Will only prevent server initialization on prod/staging
const requiredForProdTokens = {
  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
  WATERLOO_OPEN_API_BASE_URL: process.env.WATERLOO_OPEN_API_BASE_URL,
  WATERLOO_OPEN_API_KEY: process.env.WATERLOO_OPEN_API_KEY,
};

// Will only prevent server initialization on prod/staging
const authTokens = {
  ADFS_SERVER: process.env.ADFS_SERVER,
  ADFS_CLIENT_ID: process.env.ADFS_CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI,
  COOKIE_ENCRYPTION_KEY: process.env.COOKIE_ENCRYPTION_KEY,
  COOKIE_ENCRYPTION_IV: process.env.COOKIE_ENCRYPTION_IV,
  POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_AUTH_SUCCESS_REDIRECT: process.env.GOOGLE_AUTH_SUCCESS_REDIRECT,
};

const missingTokens: string[] = [];

const catchEmptyVariables = (tokenMap: Record<string, any>) => {
  for (const [key, value] of Object.entries(tokenMap)) {
    if (!value) {
      missingTokens.push(key);
    }
  }
};

catchEmptyVariables(requiredTokens);
if (requiredTokens.IS_DEVELOPMENT !== "true") {
  catchEmptyVariables(authTokens);
  catchEmptyVariables(requiredForProdTokens);
}

if (missingTokens.length) {
  missingTokens.forEach((item) =>
    console.error(`${item} is missing from .env`)
  );

  process.exit(1);
}

export default { ...requiredTokens, ...requiredForProdTokens, ...authTokens };
