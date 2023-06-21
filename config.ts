import "dotenv/config";

const tokens = {
  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
  WATERLOO_OPEN_API_BASE_URL: process.env.WATERLOO_OPEN_API_BASE_URL,
  WATERLOO_OPEN_API_KEY: process.env.WATERLOO_OPEN_API_KEY,
  ADFS_SERVER: process.env.ADFS_SERVER,
  ADFS_CLIENT_ID: process.env.ADFS_CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI,
  COOKIE_ENCRYPTION_KEY: process.env.COOKIE_ENCRYPTION_KEY,
  COOKIE_ENCRYPTION_IV: process.env.COOKIE_ENCRYPTION_IV,
  POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
  IS_PRODUCTION: process.env.IS_PRODUCTION,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

const missingTokens: string[] = [];

for (const [key, value] of Object.entries(tokens)) {
  if (!value) {
    missingTokens.push(key);
  }
}

if (missingTokens.length) {
  missingTokens.forEach((item) =>
    console.error(`${item} is missing from .env`)
  );

  process.exit(1);
}

export default tokens;
