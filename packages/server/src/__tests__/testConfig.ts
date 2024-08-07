export const testConfig = {
  JWT_SECRET: 'test_secret',
  PORT: '3001',
  DATABASE_URL: 'mock://database',
};

export function setupTestEnv() {
  Object.assign(process.env, testConfig);
}