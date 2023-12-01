import 'dotenv/config';

const expectedEnv = {
  SOURCE_INSTANCE_URL: process.env.SOURCE_INSTANCE_URL,
  SOURCE_INSTANCE_SYS_ADMIN_USERNAME:
    process.env.SOURCE_INSTANCE_SYS_ADMIN_USERNAME,
  SOURCE_INSTANCE_SYS_ADMIN_PASSWORD:
    process.env.SOURCE_INSTANCE_SYS_ADMIN_PASSWORD,
  SOURCE_INSTANCE_SYS_ADMIN_EMAIL: process.env.SOURCE_INSTANCE_SYS_ADMIN_EMAIL,
  TARGET_INSTANCE_URL: process.env.TARGET_INSTANCE_URL,
  TARGET_INSTANCE_SYS_ADMIN_USERNAME:
    process.env.TARGET_INSTANCE_SYS_ADMIN_USERNAME,
  TARGET_INSTANCE_SYS_ADMIN_PASSWORD:
    process.env.TARGET_INSTANCE_SYS_ADMIN_PASSWORD,
  TARGET_INSTANCE_SYS_ADMIN_EMAIL: process.env.TARGET_INSTANCE_SYS_ADMIN_EMAIL,
};

type ExpectedEnvKeys = keyof typeof expectedEnv;

type Env = {
  [key in ExpectedEnvKeys]: string;
};

function parseEnv(): Env {
  Object.keys(expectedEnv).forEach(key => {
    if (!expectedEnv[key]) {
      throw new Error(`Missing environment variable ${key}`);
    }
  });

  return expectedEnv as Env;
}

export const env = parseEnv();
