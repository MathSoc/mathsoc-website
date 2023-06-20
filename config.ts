import "dotenv/config";

const tokens = {
  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET ?? null,
  WATERLOO_OPEN_API_BASE_URL: process.env.WATERLOO_OPEN_API_BASE_URL ?? null,
  WATERLOO_OPEN_API_KEY: process.env.WATERLOO_OPEN_API_KEY ?? null,
  ADFS_SERVER: process.env.ADFS_SERVER ?? null,
  ADFS_CLIENT_ID: process.env.ADFS_CLIENT_ID ?? null,
  REDIRECT_URI: process.env.REDIRECT_URI ?? null,
  COOKIE_ENCRYPTION_KEY: process.env.COOKIE_ENCRYPTION_KEY ?? null,
  COOKIE_ENCRYPTION_IV: process.env.COOKIE_ENCRYPTION_IV ?? null,
  POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI ?? null,
  IS_PRODUCTION: process.env.IS_PRODUCTION ?? null,
};

const missingTokens: string[] = [];

for (const [key, value] of Object.entries(tokens)) {
  if (value === null) {
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
