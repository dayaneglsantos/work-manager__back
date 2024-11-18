import { describe, expect, it, vi } from 'vitest';
import Departament from '../../models/departamentModel';
import sql from '../../models/db';

vi.mock('../../models/db', () => ({
  default: {
    promise: () => ({
      query: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    }),
  },
}));

describe('Departaments Models', () => {
  it('should create a new departament', async () => {
    const departament = { name: 'teste', manager_id: 1 };

    const result = await Departament.create(departament);

    // expect(sql.promise().query).toHaveBeenCalledWith(
    //   'INSERT INTO departaments (name, manager_id) VALUES (?, ?)',
    //   [departament.name, departament.manager_id]
    // );
    expect(sql.promise().query).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      id: 1,
      name: 'teste',
      manager_id: 1,
    });
  });
});
