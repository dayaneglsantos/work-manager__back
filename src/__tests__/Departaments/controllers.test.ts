import { describe, expect, it, vi } from 'vitest';
import Department from '../../models/departmentModel';
import { RowDataPacket } from 'mysql2';
import {
  createDepartment,
  getDepartment,
  getAllDepartments,
  deleteDepartment,
  updateDepartment,
} from '../../controllers/departmentController';
import { Request, Response } from 'express';
import User from '../../models/userModel';

describe('Department Controllers', () => {
  it('should create a new department', async () => {
    vi.spyOn(Department, 'getByName').mockResolvedValue(null);
    vi.spyOn(Department, 'create').mockResolvedValue({
      id: 2,
      name: 'Finance',
      manager_id: 1,
    });

    const req = {
      body: {
        name: 'Finance',
        manager_id: 1,
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await createDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getByName).toHaveBeenCalledWith('Finance');
    expect(Department.create).toHaveBeenCalledWith({
      name: 'Finance',
      manager_id: 1,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 2,
      name: 'Finance',
      manager_id: 1,
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show error when trying to create a department with existing name', async () => {
    vi.spyOn(Department, 'getByName').mockResolvedValue([
      {
        id: 1,
        name: 'RH',
        manager_id: 1,
      },
    ] as RowDataPacket);
    vi.spyOn(Department, 'create').mockResolvedValue({
      id: 2,
      name: 'RH',
      manager_id: 1,
    });

    const req = {
      body: {
        name: 'RH',
        manager_id: 1,
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await createDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getByName).toHaveBeenCalledWith('RH');
    expect(Department.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is already a registered department with this name.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return error 500 when trying to create department', async () => {
    vi.spyOn(Department, 'create').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = {
      body: {
        name: 'RH',
        manager_id: 1,
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await createDepartment(req as Request, res as Response);

    expect(Department.create).toHaveBeenCalledWith({
      name: 'RH',
      manager_id: 1,
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return a department by Id', async () => {
    vi.spyOn(Department, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getDepartment(req as Request, res as Response);

    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: 'RH',
      manager_id: 1,
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return error 500 when trying get a department by Id', async () => {
    vi.spyOn(Department, 'getById').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getDepartment(req as Request, res as Response);

    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return all department', async () => {
    vi.spyOn(Department, 'getAll').mockResolvedValue([
      {
        id: 1,
        name: 'RH',
        manager_id: 1,
      },
      {
        id: 2,
        name: 'Finance',
        manager_id: 2,
      },
    ] as RowDataPacket[]);

    const req = null as unknown as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getAllDepartments(req as Request, res as Response);

    // Verificações
    expect(Department.getAll).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 1,
        name: 'RH',
        manager_id: 1,
      },
      {
        id: 2,
        name: 'Finance',
        manager_id: 2,
      },
    ]);

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return error 500 when trying get all department', async () => {
    vi.spyOn(Department, 'getAll').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = null as unknown as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getAllDepartments(req as Request, res as Response);

    // Verificações
    expect(Department.getAll).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should update a department name', async () => {
    vi.spyOn(Department, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Department, 'updateName').mockResolvedValue(true);

    const req = {
      params: { id: '1' },
      body: { name: 'novo nome' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.updateName).toHaveBeenCalledWith(1, 'novo nome');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department updated successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should update a department manager', async () => {
    vi.spyOn(Department, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Department, 'updateManager').mockResolvedValue(true);
    vi.spyOn(User, 'getById').mockResolvedValue({
      id: 2,
      name: 'Manager User',
    } as RowDataPacket);

    const req = {
      params: { id: '1' },
      body: { manager_id: 2 },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.updateManager).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department updated successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error message when trying update a non-existent department', async () => {
    vi.spyOn(Department, 'getById').mockResolvedValue(
      null as unknown as RowDataPacket
    );
    vi.spyOn(Department, 'updateManager').mockResolvedValue(true);

    const req = {
      params: { id: '1' },
      body: { manager_id: 2 },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.updateManager).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no department with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error message when trying update a department with non-existent user', async () => {
    vi.spyOn(Department, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Department, 'updateManager').mockResolvedValue(true);
    vi.spyOn(User, 'getById').mockResolvedValue(
      null as unknown as RowDataPacket
    );

    const req = {
      params: { id: '1' },
      body: { manager_id: 2 },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.updateManager).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no user with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error 500 when trying update a department', async () => {
    vi.spyOn(Department, 'getById').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = {
      params: { id: '1' },
      body: { manager_id: null },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });

  it('should delete a department by Id', async () => {
    vi.spyOn(Department, 'delete').mockResolvedValue(true);
    vi.spyOn(Department, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await deleteDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department deleted successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should retun error when trying to delete a non-existent department', async () => {
    vi.spyOn(Department, 'delete').mockResolvedValue(true);
    vi.spyOn(Department, 'getById').mockResolvedValue(
      undefined as unknown as RowDataPacket
    );

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await deleteDepartment(req as Request, res as Response);

    // Verificações
    expect(Department.getById).toHaveBeenCalledWith(1);
    expect(Department.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no department with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
});
it('should return error 500 when trying to delete a department', async () => {
  vi.spyOn(Department, 'getById').mockRejectedValue(
    new Error('Database connection error')
  );

  const req = {
    params: { id: '1' },
  } as Partial<Request>;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as Partial<Response>;

  await deleteDepartment(req as Request, res as Response);

  expect(Department.getById).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Internal Server Error',
    message: 'Database connection error',
  });

  // Restaurar mock
  vi.restoreAllMocks();
});
