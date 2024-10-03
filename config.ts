import "dotenv/config";
import fs from "fs";

// Will always prevent server initialization if this token is absent
const requiredTokens = {
  IS_DEVELOPMENT: process.env.IS_DEVELOPMENT,
  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
};

// Will only prevent server initialization on prod/staging
const requiredForProdTokens = {
  WATERLOO_OPEN_API_BASE_URL: process.env.WATERLOO_OPEN_API_BASE_URL,
  WATERLOO_OPEN_API_KEY: process.env.WATERLOO_OPEN_API_KEY,
  EXAM_BANK_ONLY: process.env.EXAM_BANK_ONLY == "true",
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
    if (value === undefined) {
      missingTokens.push(key);
    }
  }
};

const logEmptyVariablesAndMaybeExit = () => {
  if (missingTokens.length) {
    missingTokens.forEach((item) =>
      console.error(`${item} is missing from .env`)
    );

    console.error(
      "Add the environment variables listed above to your .env file. See .env.example for an example"
    );
    process.exit(1);
  }
};

if (!fs.existsSync(".env")) {
  console.error(
    '.env file not found. Create a file called ".env" in the root directory, then see the instructions in .env.example.'
  );

  process.exit(1);
}

catchEmptyVariables(requiredTokens);
logEmptyVariablesAndMaybeExit();

if (requiredTokens.IS_DEVELOPMENT !== "true") {
  catchEmptyVariables(authTokens);
  catchEmptyVariables(requiredForProdTokens);
}
logEmptyVariablesAndMaybeExit();

export default { ...requiredTokens, ...requiredForProdTokens, ...authTokens };
