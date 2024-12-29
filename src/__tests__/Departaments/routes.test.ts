import { describe, expect, it, vi, Mock } from 'vitest';
import * as DepartmentController from '../../controllers/departmentController';

import request from 'supertest';
import express, { Request, Response } from 'express';
import departmentRoutes from '../../routes/departments';

// Crie um app com as rotas
const app = express();
app.use(express.json());
app.use(departmentRoutes);

vi.mock('../../controllers/departmentController', () => ({
  getDepartment: vi.fn((req: Request, res: Response) => {
    res.status(200).json({ id: req.params.id, name: 'RH' });
  }),
  getAllDepartments: vi.fn((req: Request, res: Response) => {
    res.status(200).json([
      { id: '1', name: 'RH' },
      { id: '2', name: 'Finance' },
    ]);
  }),
  createDepartment: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ id: '1', name: 'RH' });
  }),
  updateDepartment: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ message: 'Department updated successfully' });
  }),
  deleteDepartment: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ message: 'Department deleted successfully' });
  }),
}));
describe('Department Routes', () => {
  it('should call the getDepartment controller for GET /departments/:id', async () => {
    const mockGetDepartment = DepartmentController.getDepartment as Mock;

    const response = await request(app).get('/departments/1');

    expect(mockGetDepartment).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: '1', name: 'RH' });
  }, 3000);
  it('should call the getAllDepartments controller for GET /departments', async () => {
    const mockGetDepartment = DepartmentController.getAllDepartments as Mock;

    const response = await request(app).get('/departments');

    expect(mockGetDepartment).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: '1', name: 'RH' },
      { id: '2', name: 'Finance' },
    ]);
  }, 3000);
  it('should call the createDepartment controller for  /departments', async () => {
    const mockGetDepartment = DepartmentController.createDepartment as Mock;

    const response = await request(app).post('/departments');

    expect(mockGetDepartment).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: '1', name: 'RH' });
  }, 3000);
  it('should call the deleteDepartment controller for  /departments', async () => {
    const mockGetDepartment = DepartmentController.deleteDepartment as Mock;

    const response = await request(app).delete('/departments/1');

    expect(mockGetDepartment).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Department deleted successfully',
    });
  }, 3000);
  it('should call the updateDepartment controller for  /departments', async () => {
    const mockGetDepartment = DepartmentController.updateDepartment as Mock;

    const response = await request(app).put('/departments/1');

    expect(mockGetDepartment).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Department updated successfully',
    });
  }, 3000);
});
