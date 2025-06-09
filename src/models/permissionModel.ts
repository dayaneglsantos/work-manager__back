import { ResultSetHeader, RowDataPacket } from 'mysql2';
import sql from './db';

export interface PermissionActionType {
  name: string;
}

export const PermissionActions = {
  async getAll() {
    const query = 'SELECT * FROM permission_actions';
    const [result] = await sql.promise().query(query);
    return result;
  },
  async create(action: PermissionActionType) {
    const query = `INSERT INTO permission_actions (name) VALUES (?)`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [action.name]);

    return { id: result.insertId, ...action };
  },
  async update(id: string, name: string) {
    const query = `Update permission_actions set name = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [name, id]);
    return result.affectedRows > 0;
  },
  async getById(id: string) {
    const query = `SELECT * FROM permission_actions WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByName(name: string) {
    const query = `SELECT * FROM permission_actions WHERE name = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [name]);
    return result[0];
  },
  async delete(id: string) {
    const query = `Delete FROM permission_actions WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
};

export const PermissionTypes = {
  async getAll() {
    const query = 'SELECT * FROM permission_types';
    const [result] = await sql.promise().query(query);
    return result;
  },
  async create(action: PermissionActionType) {
    const query = `INSERT INTO permission_types (name) VALUES (?)`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [action.name]);

    return { id: result.insertId, ...action };
  },
  async update(id: string, name: string) {
    const query = `Update permission_types set name = ? WHERE id = ?`;
    const [result] = await sql
      .promise()
      .query<ResultSetHeader>(query, [name, id]);
    return result.affectedRows > 0;
  },
  async getById(id: string) {
    const query = `SELECT * FROM permission_types WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByName(name: string) {
    const query = `SELECT * FROM permission_types WHERE name = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [name]);
    return result[0];
  },
  async delete(id: string) {
    const query = `Delete FROM permission_types WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
};
