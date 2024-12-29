import { ResultSetHeader, RowDataPacket } from 'mysql2';
import sql from './db';

interface Department {
  name: string;
  manager_id: number;
}

const Department = {
  async create(department: Department) {
    const query = `INSERT INTO departments (name, manager_id) VALUES (?, ?)`;
    const values = [department.name, department.manager_id];
    const [result] = await sql.promise().query<ResultSetHeader>(query, values);
    return { id: result.insertId, ...department };
  },
  async getAll() {
    const query = `SELECT * FROM departments`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query);
    return result;
  },
  async getById(id: number) {
    const query = `SELECT * FROM departments WHERE id = ?`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByName(name: string) {
    const query = `SELECT * FROM departments WHERE name = ?`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [name]);
    if (result[0] === undefined) {
      return null;
    } else {
      return result[0];
    }
  },
  async updateName(id: number, name: string) {
    const query = `UPDATE departments SET name = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [name, id]);
    return result.affectedRows > 0;
  },
  async updateManager(id: number, manager_id: number) {
    const query = `UPDATE departments SET manager_id = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [manager_id, id]);

    return result.affectedRows > 0;
  },
  async delete(id: number) {
    const query = `Delete FROM departments WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
};

export default Department;
