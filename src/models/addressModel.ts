import { ResultSetHeader, RowDataPacket } from 'mysql2';
import sql from './db';

export interface Address {
  zip_code: string;
  state: string;
  city: string;
  street: string;
  number: number;
  complement?: string;
}

const Address = {
  async create(address: Address): Promise<number> {
    const query = `INSERT INTO addresses (zip_code, state, city, street, number, complement) VALUES ( ?, ?, ?, ?, ?, ?)`;

    const values = [
      address.zip_code,
      address.state,
      address.city,
      address.street,
      address.number,
      address.complement,
    ];

    const [result] = await sql.promise().query<ResultSetHeader>(query, values);
    return result.insertId;
  },
  async getAddressById(id: number) {
    const query = `SELECT * FROM addresses WHERE id = ?`;
    const [result] = await sql.promise().query<RowDataPacket[]>(query, [id]);
    return result[0] || null;
  },
  async getAll() {
    const query = 'SELECT * FROM addresses';
    const [result] = await sql.promise().query(query);
    return result;
  },
  async update(id: string, fieldsToUpdate = {}) {
    const columns = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);
    const setClause = columns.map((column) => `${column} = ?`).join(', ');
    values.push(id);

    const query = `Update addresses set ${setClause} WHERE id = ?`;
    const [result] = await sql.promise().query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  },
};

export default Address;
