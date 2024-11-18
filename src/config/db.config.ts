import dotenv from 'dotenv';

dotenv.config();

export default {
  HOST: process.env.db_host,
  USER: process.env.db_user,
  PASSWORD: process.env.db_password,
  DB: process.env.db_name,
};
