import { expect } from '@playwright/test';
import { env } from './env';
import { test } from './fixtures';

test('user should be able to map all content mappings with multiple page', async ({
  sourceInstanceContext,
  targetInstanceContext,
}) => {
  test.setTimeout(60 * 60 * 1000);

  const totalTriggers = 199;
  const totalTriggerCopies = totalTriggers - 1;
  const sourceInstance = await sourceInstanceContext.newPage();
  const targetInstance = await targetInstanceContext.newPage();

  const testAppName = `${Date.now()}_app_A`;
  const testPackageName = `${Date.now()}_package_A`;
  let appAdminUrl: string;
  const initialTriggerName = '001_trigger';

  await test.step('create source app', async () => {
    await sourceInstance.goto('/Admin/App');
    await sourceInstance.getByRole('button', { name: 'Create App' }).click();
    await sourceInstance.getByRole('button', { name: 'Continue' }).click();
    await sourceInstance.getByLabel('Name').fill(testAppName);
    await sourceInstance.getByRole('button', { name: 'Save' }).click();
    await sourceInstance.waitForURL(/Admin\/App\/\d+/);
    appAdminUrl = sourceInstance.url();
  });

  await test.step('create trigger with a content mapping', async () => {
    await sourceInstance.locator('#tab-strip').getByText('Triggers').click();
    await sourceInstance.getByRole('link', { name: 'Add Trigger' }).click();
    await sourceInstance.locator('input[name="Name"]').fill(initialTriggerName);
    await sourceInstance.getByRole('button', { name: 'Save' }).click();

    await sourceInstance.waitForLoadState('networkidle');

    const triggerFrame = sourceInstance
      .locator('div', {
        has: sourceInstance.getByText(/Triggers:/),
      })
      .frameLocator('iframe');

    await triggerFrame.locator('#dialog-tab-strip').getByText('Rules').click();
    await triggerFrame.getByText('Select a Field').click();
    await triggerFrame.getByText('Created By').click();
    await triggerFrame.locator('#Rules').getByText('Is Empty').click();
    await triggerFrame.getByRole('option', { name: 'Contains Any' }).click();
    await triggerFrame.locator('.reference').click();

    await sourceInstance.waitForLoadState('networkidle');

    const recordsPickerFrame = sourceInstance
      .locator('div', {
        has: sourceInstance.getByText('Select Records'),
      })
      .frameLocator('iframe');

    await recordsPickerFrame
      .getByPlaceholder('Search')
      .pressSequentially(env.SOURCE_INSTANCE_SYS_ADMIN_EMAIL, {
        delay: 125,
      });

    await sourceInstance.waitForResponse(
      /\/Content\/ReferenceGrid\/SelectorSearch/
    );

    await recordsPickerFrame
      .getByRole('row', { name: env.SOURCE_INSTANCE_SYS_ADMIN_EMAIL })
      .getByRole('checkbox')
      .click();

    await recordsPickerFrame.getByRole('button', { name: 'Select' }).click();
    await sourceInstance.getByRole('button', { name: 'OK' }).click();

    await triggerFrame.getByRole('button', { name: 'Add' }).click();
    await sourceInstance.getByRole('button', { name: 'Save' }).click();
  });

  await test.step(`create ${totalTriggerCopies} copies of the original trigger`, async () => {
    for (let i = 0; i < totalTriggerCopies; i++) {
      await sourceInstance.goto(appAdminUrl);
      await sourceInstance.locator('#tab-strip').getByText('Triggers').click();

      const latestTrigger = sourceInstance.locator('#grid-triggers tr').last();
      const latestTriggerName = await latestTrigger
        .locator('td')
        .first()
        .textContent();

      const latestTriggerNumber = parseInt(latestTriggerName!.split('_')[0]);
      const nextTriggerNumber = `${latestTriggerNumber + 1}`.padStart(3, '0');
      const nextTriggerName = `${nextTriggerNumber}_trigger`;

      await latestTrigger.hover();
      await latestTrigger.getByTitle('Copy Trigger').click();
      await sourceInstance.getByLabel('Name').fill(nextTriggerName);
      await sourceInstance.getByRole('button', { name: 'Copy' }).click();
      await sourceInstance.waitForLoadState('networkidle');
      await sourceInstance.getByRole('button', { name: 'Save' }).click();
    }
  });

  await test.step('create package', async () => {
    await targetInstance.goto('/Admin/Package');
    await targetInstance
      .getByRole('button', { name: 'Create Package' })
      .click();

    await targetInstance.locator('input[name="Name"]').fill(testPackageName);
    await targetInstance.getByRole('button', { name: 'Save' }).click();
    await targetInstance.waitForURL(/Admin\/Package\/\d+\/Edit/);
  });

  await test.step('add source app to package', async () => {
    await targetInstance
      .getByRole('listbox', { name: 'Package Source' })
      .click();

    await targetInstance
      .getByRole('option', { name: new URL(env.SOURCE_INSTANCE_URL).host })
      .click();

    await targetInstance
      .getByRole('link', { name: 'Edit Selected Components' })
      .click();

    await targetInstance.waitForLoadState('networkidle');

    await targetInstance
      .getByRole('treeitem')
      .filter({ has: targetInstance.locator('div.k-top'), hasText: 'Apps' })
      .locator('.k-i-expand')
      .click();

    await targetInstance
      .getByRole('treeitem', { name: testAppName })
      .getByRole('checkbox')
      .click();

    await targetInstance.getByRole('button', { name: 'Ok' }).click();

    await targetInstance.waitForResponse(/\/Admin\/Package\/GetSelectedNodes/);
  });

  await test.step('map all content mappings', async () => {
    await targetInstance
      .getByRole('link', { name: 'Save Changes & Run' })
      .click();
    await targetInstance.waitForLoadState('networkidle');

    await targetInstance.getByRole('button', { name: 'Next' }).click();

    await targetInstance.waitForLoadState('networkidle');

    const packageModalFrame = targetInstance
      .locator('div', {
        has: targetInstance.getByText('Package Run Configuration'),
      })
      .frameLocator('iframe');

    let currentPage = 1;
    let totalPages = 1;

    do {
      const paginationInfo = packageModalFrame.getByText(/Page (\d+) of (\d+)/);

      if (await paginationInfo.isVisible()) {
        const paginationText = await paginationInfo.textContent();
        const [, curr, , total] = paginationText!.split(/\s+/);
        currentPage = parseInt(curr);
        totalPages = parseInt(total);
      }

      const unmappedMappings = packageModalFrame
        .locator('tr[data-mapping]')
        .filter({ has: packageModalFrame.getByText('Select a value') });

      let numOfUnmappedMappings = await unmappedMappings.count();

      while (numOfUnmappedMappings > 0) {
        const mapping = packageModalFrame.locator('[data-mapping]').first();
        await mapping.getByText('Select a value').click();

        const recordPickerFrame = targetInstance
          .locator('div', { has: targetInstance.getByText('Select a Record') })
          .frameLocator('iframe');

        await recordPickerFrame
          .getByPlaceholder('Search')
          .pressSequentially(env.SOURCE_INSTANCE_SYS_ADMIN_EMAIL, {
            delay: 125,
          });

        await targetInstance.waitForResponse(
          /\/Content\/ReferenceGrid\/SelectorForAppSearch/
        );

        await recordPickerFrame
          .getByRole('row', { name: env.SOURCE_INSTANCE_SYS_ADMIN_EMAIL })
          .getByRole('radio')
          .click();

        await recordPickerFrame.getByRole('button', { name: 'Select' }).click();

        await targetInstance.getByRole('button', { name: 'OK' }).click();

        const duplicateValueModal =
          targetInstance.getByText('Duplicate Values');

        if (await duplicateValueModal.isVisible()) {
          await targetInstance
            .getByRole('button', { name: 'Replace All Values' })
            .click();
        }

        await targetInstance.waitForLoadState('networkidle');

        numOfUnmappedMappings = await unmappedMappings.count();
      }

      await targetInstance.getByRole('button', { name: 'Next' }).click();
      await targetInstance.waitForLoadState('networkidle');
    } while (currentPage < totalPages);
  });

  await test.step('verify there are no package warnings', async () => {
    const warningText = targetInstance.getByText(
      /The following information warnings/
    );

    await expect(warningText).not.toBeVisible();
  });
});
