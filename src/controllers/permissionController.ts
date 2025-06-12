// import { Request, Response } from 'express';
// import { PermissionActions, PermissionTypes } from '../models/permissionModel';

// // // _________________________________ Permission Actions Controller _________________________________

// export const getAllPermissionActions = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const action = await PermissionActions.getAll();

//     return res.status(200).json(action);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const updatePermissionAction = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;
//   const { name } = req.body;

//   if (name) {
//     try {
//       await PermissionActions.update(id, name);

//       return res.status(201).json({ message: 'Action updated successfully' });
//     } catch (error) {
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// };

// export const createPermissionAction = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { name } = req.body;

//   try {
//     const existingAction = await PermissionActions.getByName(name);

//     if (existingAction) {
//       return res.status(400).json({
//         error: 'There is already a permission action with this name.',
//       });
//     }

//     const newAction = await PermissionActions.create({ name: name });

//     return res.status(201).json(newAction);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const deletePermissionAction = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;

//   try {
//     const action = await PermissionActions.delete(id);

//     if (!action) {
//       return res.status(404).json({ error: 'There is no action with this id' });
//     }

//     return res.status(201).json({ message: 'Action deleted successfully' });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
// // _________________________________ Permission Types Controller _________________________________

// export const getAllPermissionTypes = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const types = await PermissionTypes.getAll();

//     return res.status(200).json(types);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const updatePermissionType = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;
//   const { name } = req.body;

//   if (name) {
//     try {
//       await PermissionTypes.update(id, name);

//       return res.status(201).json({ message: 'Type updated successfully' });
//     } catch (error) {
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// };

// export const createPermissionType = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { name } = req.body;

//   try {
//     const existingType = await PermissionTypes.getByName(name);

//     if (existingType) {
//       return res.status(400).json({
//         error: 'There is already a permission type with this name.',
//       });
//     }

//     const newType = await PermissionTypes.create({ name: name });

//     return res.status(201).json(newType);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const deletePermissionType = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;

//   try {
//     const type = await PermissionTypes.delete(id);

//     if (!type) {
//       return res.status(404).json({ error: 'There is no type with this id' });
//     }

//     return res.status(201).json({ message: 'Type deleted successfully' });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
