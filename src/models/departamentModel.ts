import { ResultSetHeader, RowDataPacket } from 'mysql2';
import sql from './db';

interface Departament {
  name: string;
  manager_id: number;
}

const Departament = {
  async create(departament: Departament) {
    const query = `INSERT INTO departaments (name, manager_id) VALUES (?, ?)`;
    const values = [departament.name, departament.manager_id];
    const [result] = await sql.promise().query<ResultSetHeader>(query, values);
    return { id: result.insertId, ...departament };
  },
  async getAll() {
    const query = `SELECT * FROM departaments`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query);
    return result;
  },
  async getById(id: number) {
    const query = `SELECT * FROM departaments WHERE id = ?`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByName(name: string) {
    const query = `SELECT * FROM departaments WHERE name = ?`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [name]);
    if (result[0] === undefined) {
      return null;
    } else {
      return result[0];
    }
  },
  async updateName(id: number, name: string) {
    const query = `UPDATE departaments SET name = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [name, id]);
    return result.affectedRows > 0;
  },
  async updateManager(id: number, manager_id: number) {
    const query = `UPDATE departaments SET manager_id = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [manager_id, id]);

    return result.affectedRows > 0;
  },
  async delete(id: number) {
    const query = `Delete FROM departaments WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
};

export default Departament;
