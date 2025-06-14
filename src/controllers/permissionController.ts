import { Request, Response } from 'express';
import prisma from '../services/prisma';

// // _________________________________ Permission Actions Controller _________________________________

export const getAllPermissionActions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const action = await prisma.permissionAction.findMany();

    return res.status(200).json(action);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      await prisma.permissionAction.update({
        where: { id: Number(id) },
        data: { name: name },
      });

      return res.status(201).json({ message: 'Action updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const createPermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingAction = await prisma.permissionAction.findUnique({
      where: { name: name },
    });

    if (existingAction) {
      return res.status(400).json({
        error: 'There is already a permission action with this name.',
      });
    }

    const newAction = await prisma.permissionAction.create({
      data: { name: name },
    });

    return res.status(201).json(newAction);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const action = await prisma.permissionAction.delete({
      where: { id: Number(id) },
    });

    if (!action) {
      return res.status(404).json({ error: 'There is no action with this id' });
    }

    return res.status(201).json({ message: 'Action deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
// _________________________________ Permission Types Controller _________________________________

export const getAllPermissionTypes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const types = await prisma.permissionType.findMany();

    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      await prisma.permissionType.update({
        where: { id: Number(id) },
        data: { name },
      });

      return res
        .status(201)
        .json({ message: 'Permisiion type updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const createPermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingType = await prisma.permissionType.findUnique({
      where: { name: name },
    });

    if (existingType) {
      return res.status(400).json({
        error: 'There is already a permission type with this name.',
      });
    }

    const newType = await prisma.permissionType.create({
      data: { name: name },
    });

    return res.status(201).json(newType);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const type = await prisma.permissionType.delete({
      where: { id: Number(id) },
    });

    if (!type) {
      return res.status(404).json({ error: 'There is no type with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Permission type deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// _________________________________ Permissions _________________________________
export const getAllPermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const permissions = await prisma.permission.findMany();

    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { actionId, typeId } = req.body;

  const type = await prisma.permissionType.findUnique({
    where: { id: typeId },
  });
  const action = await prisma.permissionAction.findUnique({
    where: { id: actionId },
  });

  if (!type) {
    return res.status(400).json({ error: 'Invalid permission type ID' });
  }
  if (!action) {
    return res.status(400).json({ error: 'Invalid permission action ID' });
  }

  const name = `${action.name}-${type.name}`;

  try {
    const existingType = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingType) {
      return res.status(400).json({
        error: 'There is already a permission with this name.',
      });
    }

    const newPermission = await prisma.permission.create({
      data: { name, actionId, typeId },
    });

    return res.status(201).json(newPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const editPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, actionId, typeId } = req.body;

  try {
    await prisma.permission.update({
      where: { id: Number(id) },
      data: { name, actionId, typeId },
    });

    return res.status(201).json({ message: 'Permission updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const deletePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const permission = await prisma.permission.delete({
      where: { id: Number(id) },
    });

    if (!permission) {
      return res
        .status(404)
        .json({ error: 'There is no permission with this id' });
    }

    return res.status(201).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// _________________________________ Default Profile Permissions _________________________________
export const getAllProfilePermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const permissions = await prisma.profilePermission.findMany();

    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { profileId, permissionId, hasPermission } = req.body;

  try {
    const newProfilePermission = await prisma.profilePermission.create({
      data: { profileId, permissionId, hasPermission },
    });

    return res.status(201).json(newProfilePermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { profileId, permissionId, hasPermission } = req.body;

  try {
    const updatedProfilePermission = await prisma.profilePermission.update({
      where: { id: Number(id) },
      data: { profileId, permissionId, hasPermission },
    });

    return res.status(201).json(updatedProfilePermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const profilePermission = await prisma.profilePermission.delete({
      where: { id: Number(id) },
    });

    if (!profilePermission) {
      return res
        .status(404)
        .json({ error: 'There is no profile permission with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Profile permission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// _________________________________ Custom Permissions _________________________________
export const getAllCustomPermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const customPermissions = await prisma.customPermission.findMany();

    return res.status(200).json(customPermissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId, permissionId, hasPermission } = req.body;

  try {
    const newCustomPermission = await prisma.customPermission.create({
      data: { userId, permissionId, hasPermission },
    });

    return res.status(201).json(newCustomPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { userId, permissionId, hasPermission } = req.body;

  try {
    const updatedCustomPermission = await prisma.customPermission.update({
      where: { id: Number(id) },
      data: { userId, permissionId, hasPermission },
    });

    return res.status(201).json(updatedCustomPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const customPermission = await prisma.customPermission.delete({
      where: { id: Number(id) },
    });

    if (!customPermission) {
      return res
        .status(404)
        .json({ error: 'There is no custom permission with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Custom permission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
