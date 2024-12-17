import sql from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface ProfileType {
  name: string;
}

const Profile = {
  async getAll() {
    const query = 'SELECT * FROM profiles';
    const [result] = await sql.promise().query(query);
    return result;
  },

  async getById(id: string) {
    const query = `SELECT * FROM profiles WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByName(name: string) {
    const query = `SELECT * FROM profiles WHERE name = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [name]);
    return result[0];
  },
  async create(profile: ProfileType) {
    const query = `INSERT INTO profiles (name) VALUES (?)`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [profile.name]);

    return { id: result.insertId, ...profile };
  },
  async delete(id: string) {
    const query = `Delete FROM profiles WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
  async update(id: string, name: string) {
    const query = `Update profiles set name = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [name, id]);
    return result.affectedRows > 0;
  },
};

export default Profile;
