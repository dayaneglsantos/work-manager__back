# Backend authentication tests

The authentication suite uses Vitest, Supertest, Prisma, and an isolated MySQL
container. It never connects to the development database.

## Run the suite

```sh
docker compose -f docker-compose.test.yml build test
docker compose -f docker-compose.test.yml run --rm test
docker compose -f docker-compose.test.yml down
```

The test service applies the Prisma schema to a temporary `work_manager_test`
database before running Vitest. MySQL data is stored in `tmpfs` and is removed
when the test stack is stopped.

## Structure

- `auth/login.test.ts`: login, email normalization, access status, permissions,
  cookies, JWT, and logout.
- `auth/passwordReset.test.ts`: password-reset requests, codes, tokens,
  password validation, consumption, and artifact invalidation.
- `auth/rateLimit.test.ts`: account and IP limits for login and recovery.
- `helpers/database.ts`: isolated fixtures and database cleanup.
- `setup.ts`: environment variables required by the test process.

Email delivery is mocked in the integration suite. Mailpit remains available for
manual and future end-to-end tests of the complete SMTP flow.
