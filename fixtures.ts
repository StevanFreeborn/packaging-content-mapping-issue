import { BrowserContext, test as base } from '@playwright/test';
import { env } from './env';
import {
  SOURCE_INSTANCE_AUTH_PATH,
  TARGET_INSTANCE_AUTH_PATH,
} from './playwright.config';

type TestFixtures = {
  sourceInstanceContext: BrowserContext;
  targetInstanceContext: BrowserContext;
};

const test = base.extend<TestFixtures>({
  sourceInstanceContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: env.SOURCE_INSTANCE_URL,
      storageState: SOURCE_INSTANCE_AUTH_PATH,
    });

    await use(context);

    await context.close();
  },
  targetInstanceContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: env.TARGET_INSTANCE_URL,
      storageState: TARGET_INSTANCE_AUTH_PATH,
    });

    await use(context);

    await context.close();
  },
});

export { test };
