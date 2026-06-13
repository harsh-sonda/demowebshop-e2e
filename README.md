# demowebshop-e2e

End-to-end test automation for [Demo Web Shop](https://demowebshop.tricentis.com/) using Playwright and TypeScript.

## Structure

```
├── playwright.config.ts
├── tests/
│   ├── 01_register.spec.ts
│   └── 02_login.spec.ts
└── support/
    ├── PageMethod/login.ts, register.ts
    ├── testData/*.json
    └── utils/misc/
```

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env` and optionally set pre-seeded credentials:

```
BASE_URL=https://demowebshop.tricentis.com
REGISTER_EMAIL=
REGISTER_PASSWORD=
```

## Run tests

```bash
npm test
npm run test:headed
npm run report
```

Target a single spec:

```bash
npx playwright test tests/01_register.spec.ts
npx playwright test tests/02_login.spec.ts
```
