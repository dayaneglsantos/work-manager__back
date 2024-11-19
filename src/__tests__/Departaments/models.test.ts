import { describe, expect, it, vi } from 'vitest';
import Departament from '../../models/departamentModel';
import sql from '../../models/db';

const mockQuery = vi.fn();

vi.mock('../../models/db', () => ({
  default: {
    promise: () => ({
      query: mockQuery,
    }),
  },
}));

describe('Departaments Models', () => {
  it('should create a new departament', async () => {
    mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
    const departament = { name: 'teste', manager_id: 1 };

    const result = await Departament.create(departament);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'INSERT INTO departaments (name, manager_id) VALUES (?, ?)',
      [departament.name, departament.manager_id]
    );
    expect(result).toEqual({
      id: 1,
      name: 'teste',
      manager_id: 1,
    });
  });
  it('should edit a manager departament', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const newManagerId = 2;
    const departamentId = 1;

    const result = await Departament.updateManager(departamentId, newManagerId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'UPDATE departaments SET manager_id = ? WHERE id = ?',
      [newManagerId, departamentId]
    );
    expect(result).toEqual(true);
  });
  it('should edit a name departament', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const newDepartamentName = 'teste2';
    const departamentId = 1;

    const result = await Departament.updateName(
      departamentId,
      newDepartamentName
    );

    expect(sql.promise().query).toHaveBeenCalledWith(
      'UPDATE departaments SET name = ? WHERE id = ?',
      [newDepartamentName, departamentId]
    );
    expect(result).toEqual(true);
  });
  it('should get a departament', async () => {
    const mockDepartament = {
      id: 1,
      name: 'teste',
      manager_id: 1,
    };
    mockQuery.mockResolvedValueOnce([[mockDepartament]]);

    const departamentId = 1;

    const result = await Departament.getById(departamentId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departaments WHERE id = ?',
      [departamentId]
    );
    expect(result).toEqual(mockDepartament);
  });
  it('should get a departament by name', async () => {
    const mockDepartament = {
      id: 1,
      name: 'teste',
      manager_id: 1,
    };
    mockQuery.mockResolvedValueOnce([[mockDepartament]]);

    const departamentName = 'teste';

    const result = await Departament.getByName(departamentName);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departaments WHERE name = ?',
      [departamentName]
    );
    expect(result).toEqual(mockDepartament);
  });
  it('should get all departaments', async () => {
    const mockDepartament = [
      {
        id: 1,
        name: 'teste',
        manager_id: 1,
      },
      {
        id: 1,
        name: 'teste',
        manager_id: 1,
      },
    ];
    mockQuery.mockResolvedValueOnce([mockDepartament]);

    const result = await Departament.getAll();

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departaments'
    );
    expect(result).toEqual(mockDepartament);
  });
  it('should delete a departament', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const departamentId = 1;

    const result = await Departament.delete(departamentId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'Delete FROM departaments WHERE id = ? LIMIT 1',
      [departamentId]
    );
    expect(result).toEqual(true);
  });
});
