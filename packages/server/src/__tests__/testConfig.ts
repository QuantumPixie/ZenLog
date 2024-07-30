import config from '../config';

process.env.JWT_SECRET = 'test_secret';

export const testConfig = {
  ...config,
  port: 3001
};