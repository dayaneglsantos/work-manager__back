import { ResultSetHeader } from 'mysql2';
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
};

export default Address;
