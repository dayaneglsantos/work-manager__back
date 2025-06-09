import { UserType } from '../types/userType';
import sql from './db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const User = {
  async getAll() {
    const query = 'SELECT * FROM users';
    const [result] = await sql.promise().query(query);
    return result;
  },

  async getById(id: string) {
    const query = `SELECT * FROM users WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0];
  },
  async getByEmail(email: string) {
    const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [email]);
    return result[0];
  },
  async getUserSession(email: string) {
    const query = `SELECT * FROM user_session WHERE email = ? LIMIT 1`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [email]);
    return result[0];
  },
  async create(user: UserType) {
    const query = `      INSERT INTO users (
        name, email, phone_number, address_id, emergency_contact, birthday, profile_img,
        password, profile_id, supervisor_id, department_id, current_salary,
        admission_date, current_position, employment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      user.name,
      user.email,
      user.phone_number,
      user.address_id,
      user.emergency_contact,
      user.birthday,
      user.profile_img,
      user.password,
      user.profile_id,
      user.supervisor_id,
      user.department_id,
      user.current_salary,
      user.admission_date,
      user.current_position,
      user.employment_status,
      user.notes,
    ];

    const [result] = await sql.promise().query<ResultSetHeader>(query, values);

    return { id: result.insertId, ...user, password: null };
  },
  async delete(id: string) {
    const query = `Delete FROM users WHERE id = ? LIMIT 1`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  },
  async update(id: string, fieldsToUpdate = {}) {
    const columns = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);
    const setClause = columns.map((column) => `${column} = ?`).join(', ');
    values.push(id);

    const query = `Update users set ${setClause} WHERE id = ?`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  },
};

export default User;
