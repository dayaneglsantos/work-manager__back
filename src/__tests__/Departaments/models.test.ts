import { describe, expect, it, vi } from 'vitest';
import Department from '../../models/departmentModel';
import sql from '../../models/db';

const mockQuery = vi.fn();

vi.mock('../../models/db', () => ({
  default: {
    promise: () => ({
      query: mockQuery,
    }),
  },
}));

describe('Departments Models', () => {
  it('should create a new department', async () => {
    mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
    const department = { name: 'teste', manager_id: 1 };

    const result = await Department.create(department);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'INSERT INTO departments (name, manager_id) VALUES (?, ?)',
      [department.name, department.manager_id]
    );
    expect(result).toEqual({
      id: 1,
      name: 'teste',
      manager_id: 1,
    });
  });
  it('should edit a manager department', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const newManagerId = 2;
    const departmentId = 1;

    const result = await Department.updateManager(departmentId, newManagerId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'UPDATE departments SET manager_id = ? WHERE id = ?',
      [newManagerId, departmentId]
    );
    expect(result).toEqual(true);
  });
  it('should edit a name department', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const newDepartmentName = 'teste2';
    const departmentId = 1;

    const result = await Department.updateName(departmentId, newDepartmentName);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'UPDATE departments SET name = ? WHERE id = ?',
      [newDepartmentName, departmentId]
    );
    expect(result).toEqual(true);
  });
  it('should get a department', async () => {
    const mockDepartment = {
      id: 1,
      name: 'teste',
      manager_id: 1,
    };
    mockQuery.mockResolvedValueOnce([[mockDepartment]]);

    const departmentId = 1;

    const result = await Department.getById(departmentId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departments WHERE id = ?',
      [departmentId]
    );
    expect(result).toEqual(mockDepartment);
  });
  it('should get a department by name', async () => {
    const mockDepartment = {
      id: 1,
      name: 'teste',
      manager_id: 1,
    };
    mockQuery.mockResolvedValueOnce([[mockDepartment]]);

    const departmentName = 'teste';

    const result = await Department.getByName(departmentName);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departments WHERE name = ?',
      [departmentName]
    );
    expect(result).toEqual(mockDepartment);
  });
  it('should get all departments', async () => {
    const mockDepartment = [
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
    mockQuery.mockResolvedValueOnce([mockDepartment]);

    const result = await Department.getAll();

    expect(sql.promise().query).toHaveBeenCalledWith(
      'SELECT * FROM departments'
    );
    expect(result).toEqual(mockDepartment);
  });
  it('should delete a department', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const departmentId = 1;

    const result = await Department.delete(departmentId);

    expect(sql.promise().query).toHaveBeenCalledWith(
      'Delete FROM departments WHERE id = ? LIMIT 1',
      [departmentId]
    );
    expect(result).toEqual(true);
  });
});
