import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://mova:mova@localhost:5432/mova_test",
      REDIS_URL: "redis://localhost:6379/1",
      JWT_SECRET: "test-secret-test-secret-test-secret",
      PAYSTACK_SECRET_KEY: "",
      WEB_ORIGIN: "http://localhost:3000",
    },
    fileParallelism: false,
    testTimeout: 20000,
  },
});
