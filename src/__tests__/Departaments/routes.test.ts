import { describe, expect, it, vi, Mock } from 'vitest';
import * as DepartamentController from '../../controllers/departamentController';

import request from 'supertest';
import express, { Request, Response } from 'express';
import departamentRoutes from '../../routes/departaments';

// Crie um app com as rotas
const app = express();
app.use(express.json());
app.use(departamentRoutes);

vi.mock('../../controllers/departamentController', () => ({
  getDepartament: vi.fn((req: Request, res: Response) => {
    res.status(200).json({ id: req.params.id, name: 'RH' });
  }),
  getAllDepartaments: vi.fn((req: Request, res: Response) => {
    res.status(200).json([
      { id: '1', name: 'RH' },
      { id: '2', name: 'Finance' },
    ]);
  }),
  createDepartament: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ id: '1', name: 'RH' });
  }),
  updateDepartament: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ message: 'Department updated successfully' });
  }),
  deleteDepartament: vi.fn((req: Request, res: Response) => {
    res.status(201).json({ message: 'Department deleted successfully' });
  }),
}));
describe('Departament Routes', () => {
  it('should call the getDepartament controller for GET /departaments/:id', async () => {
    const mockGetDepartament = DepartamentController.getDepartament as Mock;

    const response = await request(app).get('/departaments/1');

    expect(mockGetDepartament).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: '1', name: 'RH' });
  }, 3000);
  it('should call the getAllDepartaments controller for GET /departaments', async () => {
    const mockGetDepartament = DepartamentController.getAllDepartaments as Mock;

    const response = await request(app).get('/departaments');

    expect(mockGetDepartament).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: '1', name: 'RH' },
      { id: '2', name: 'Finance' },
    ]);
  }, 3000);
  it('should call the createDepartament controller for  /departaments', async () => {
    const mockGetDepartament = DepartamentController.createDepartament as Mock;

    const response = await request(app).post('/departaments');

    expect(mockGetDepartament).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: '1', name: 'RH' });
  }, 3000);
  it('should call the deleteDepartament controller for  /departaments', async () => {
    const mockGetDepartament = DepartamentController.deleteDepartament as Mock;

    const response = await request(app).delete('/departaments/1');

    expect(mockGetDepartament).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Department deleted successfully',
    });
  }, 3000);
  it('should call the updateDepartament controller for  /departaments', async () => {
    const mockGetDepartament = DepartamentController.updateDepartament as Mock;

    const response = await request(app).put('/departaments/1');

    expect(mockGetDepartament).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Department updated successfully',
    });
  }, 3000);
});
