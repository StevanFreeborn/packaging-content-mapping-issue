# Packaging Content Mapping Issue

## Description

This is a test project that demonstrates an issue with content mapping within packaging. The issue is that not all possible content mappings are being displayed across all the content mapping pages. This means that after an admin performs all the required mappings there are still unmapped items that the admin has no way of accessing and mapping. This can also be confusing if the admin doesn't notice this on the warnings page and thinks that they have mapped all the content.

## Requirements

- Node.js
- npm

## Steps to Reproduce

1. Clone this repo

```bash
git clone https://github.com/StevanFreeborn/packaging-content-mapping-issue.git
```

2. Install dependencies

```bash
npm install
```

3. Install playwright dependencies

```bash
npm run playwright:install
```

4. Copy the `example.env` file to `.env` and update the values to match your setup.

```bash
cp example.env .env
```

5. Run the test.

```bash
npm run test
```

If you want to run the tests in headed mode

```bash
npm run test:headed
```

**NOTE:** If you set the `TOTAL_MAPPINGS_TO_CREATE` env variable to something small - like 2 - you should find the test passes. If you set it to something large like 800 you should find the test fails. Obviously the larger that number becomes the longer the test will take to run.
