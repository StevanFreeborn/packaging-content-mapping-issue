import { Page, test as setup } from '@playwright/test';
import { env } from './env';
import {
  SOURCE_INSTANCE_AUTH_PATH,
  TARGET_INSTANCE_AUTH_PATH,
} from './playwright.config';

setup.describe('setup', () => {
  setup('login to source instance', async ({ page }) => {
    await loginToInstance({
      page,
      instanceUrl: env.SOURCE_INSTANCE_URL,
      username: env.SOURCE_INSTANCE_SYS_ADMIN_USERNAME,
      password: env.SOURCE_INSTANCE_SYS_ADMIN_PASSWORD,
      storageStatePath: SOURCE_INSTANCE_AUTH_PATH,
    });
  });

  setup('login to target instance', async ({ page }) => {
    await loginToInstance({
      page,
      instanceUrl: env.TARGET_INSTANCE_URL,
      username: env.TARGET_INSTANCE_SYS_ADMIN_USERNAME,
      password: env.TARGET_INSTANCE_SYS_ADMIN_PASSWORD,
      storageStatePath: TARGET_INSTANCE_AUTH_PATH,
    });
  });
});

async function loginToInstance({
  page,
  instanceUrl,
  username,
  password,
  storageStatePath,
}: {
  page: Page;
  instanceUrl: string;
  username: string;
  password: string;
  storageStatePath: string;
}) {
  await page.goto(`${instanceUrl}/Public/Login`);

  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);

  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(`${instanceUrl}/Dashboard`);

  await page.context().storageState({ path: storageStatePath });
  await page.close();
}
