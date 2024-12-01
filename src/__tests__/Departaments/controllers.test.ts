import { describe, expect, it, vi } from 'vitest';
import Departament from '../../models/departamentModel';
import { RowDataPacket } from 'mysql2';
import {
  createDepartament,
  getDepartament,
  getAllDepartaments,
  deleteDepartament,
  updateDepartament,
} from '../../controllers/departamentController';
import { Request, Response } from 'express';
import User from '../../models/userModel';

describe('Departament Controllers', () => {
  it('should create a new departament', async () => {
    vi.spyOn(Departament, 'getByName').mockResolvedValue(null);
    vi.spyOn(Departament, 'create').mockResolvedValue({
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

    await createDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getByName).toHaveBeenCalledWith('Finance');
    expect(Departament.create).toHaveBeenCalledWith({
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
  it('should show error when trying to create a departament with existing name', async () => {
    vi.spyOn(Departament, 'getByName').mockResolvedValue([
      {
        id: 1,
        name: 'RH',
        manager_id: 1,
      },
    ] as RowDataPacket);
    vi.spyOn(Departament, 'create').mockResolvedValue({
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

    await createDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getByName).toHaveBeenCalledWith('RH');
    expect(Departament.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is already a registered departament with this name.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return error 500 when trying to create departament', async () => {
    vi.spyOn(Departament, 'create').mockRejectedValue(
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

    await createDepartament(req as Request, res as Response);

    expect(Departament.create).toHaveBeenCalledWith({
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
  it('should return a departament by Id', async () => {
    vi.spyOn(Departament, 'getById').mockResolvedValue({
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

    await getDepartament(req as Request, res as Response);

    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: 'RH',
      manager_id: 1,
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return error 500 when trying get a departament by Id', async () => {
    vi.spyOn(Departament, 'getById').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getDepartament(req as Request, res as Response);

    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should return all departament', async () => {
    vi.spyOn(Departament, 'getAll').mockResolvedValue([
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

    await getAllDepartaments(req as Request, res as Response);

    // Verificações
    expect(Departament.getAll).toHaveBeenCalledWith();
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
  it('should return error 500 when trying get all departament', async () => {
    vi.spyOn(Departament, 'getAll').mockRejectedValue(
      new Error('Database connection error')
    );

    const req = null as unknown as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await getAllDepartaments(req as Request, res as Response);

    // Verificações
    expect(Departament.getAll).toHaveBeenCalledWith();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should update a departament name', async () => {
    vi.spyOn(Departament, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Departament, 'updateName').mockResolvedValue(true);

    const req = {
      params: { id: '1' },
      body: { name: 'novo nome' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.updateName).toHaveBeenCalledWith(1, 'novo nome');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department updated successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should update a departament manager', async () => {
    vi.spyOn(Departament, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Departament, 'updateManager').mockResolvedValue(true);
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

    await updateDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.updateManager).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department updated successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error message when trying update a non-existent departament', async () => {
    vi.spyOn(Departament, 'getById').mockResolvedValue(
      null as unknown as RowDataPacket
    );
    vi.spyOn(Departament, 'updateManager').mockResolvedValue(true);

    const req = {
      params: { id: '1' },
      body: { manager_id: 2 },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await updateDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.updateManager).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no departament with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error message when trying update a departament with non-existent user', async () => {
    vi.spyOn(Departament, 'getById').mockResolvedValue({
      id: 1,
      name: 'RH',
      manager_id: 1,
    } as RowDataPacket);
    vi.spyOn(Departament, 'updateManager').mockResolvedValue(true);
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

    await updateDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.updateManager).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no user with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should show a error 500 when trying update a departament', async () => {
    vi.spyOn(Departament, 'getById').mockRejectedValue(
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

    await updateDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Database connection error',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });

  it('should delete a departament by Id', async () => {
    vi.spyOn(Departament, 'delete').mockResolvedValue(true);
    vi.spyOn(Departament, 'getById').mockResolvedValue({
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

    await deleteDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Department deleted successfully',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
  it('should retun error when trying to delete a non-existent departament', async () => {
    vi.spyOn(Departament, 'delete').mockResolvedValue(true);
    vi.spyOn(Departament, 'getById').mockResolvedValue(
      undefined as unknown as RowDataPacket
    );

    const req = {
      params: { id: '1' },
    } as Partial<Request>;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    await deleteDepartament(req as Request, res as Response);

    // Verificações
    expect(Departament.getById).toHaveBeenCalledWith(1);
    expect(Departament.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'There is no departament with this id.',
    });

    // Restaurar mock
    vi.restoreAllMocks();
  });
});
it('should return error 500 when trying to delete a departament', async () => {
  vi.spyOn(Departament, 'getById').mockRejectedValue(
    new Error('Database connection error')
  );

  const req = {
    params: { id: '1' },
  } as Partial<Request>;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as Partial<Response>;

  await deleteDepartament(req as Request, res as Response);

  expect(Departament.getById).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Internal Server Error',
    message: 'Database connection error',
  });

  // Restaurar mock
  vi.restoreAllMocks();
});
