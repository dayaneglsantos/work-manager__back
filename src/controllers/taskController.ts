import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';
import { Prisma } from '@prisma/client';
import { getUserIdFromToken } from '../services/getUserIdFromToken';

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    title,
    description,
    status,
    deadline,
    assigneeId,
    departmentId,
    priority,
    tagsId,
  } = req.body;
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];
  const currentUserId = getUserIdFromToken(token!);

  try {
    const taskData = {
      title,
      description,
      status,
      deadline: deadline ? new Date(deadline) : null,
      priority,
      ...(assigneeId && { assignee: { connect: { id: assigneeId } } }),
      ...(currentUserId && { creator: { connect: { id: currentUserId } } }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
      ...(tagsId && {
        tags: {
          connect: tagsId.map((id: number) => ({ id })),
        },
      }),
    };

    const newTask = await prisma.task.create({
      data: taskData,
    });

    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getTaskById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        department: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Retornar direto em tags em vez de um objeto com tag
    if (task && task.tags) {
      task.tags = task.tags.map((item: any) => item.tag);
    }

    if (!task) {
      return res.status(404).json({ error: 'There is no task with this id' });
    }

    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        department: true,
        tags: true,
        // tags: true,
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    deadline,
    assigneeId,
    departmentId,
    priority,
    tagsId,
  } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const currentUserId = getUserIdFromToken(token!);

  const fieldsToUpdate: Prisma.TaskUpdateInput = {};
  const historyRecords: Prisma.TaskHistoryCreateManyInput[] = [];

  if (title) fieldsToUpdate.title = title;
  if (description) fieldsToUpdate.description = description;
  if (status) fieldsToUpdate.status = status;
  if (deadline) fieldsToUpdate.deadline = new Date(deadline);
  if (priority) fieldsToUpdate.priority = priority;
  if (assigneeId) {
    fieldsToUpdate.assignee = { connect: { id: assigneeId } };
  }
  if (departmentId) {
    fieldsToUpdate.department = { connect: { id: departmentId } };
  }

  const transactions: any[] = [
    prisma.task.update({
      where: { id: Number(id) },
      data: fieldsToUpdate,
    }),
  ];

  if (Object.keys(fieldsToUpdate).length > 0) {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!task) {
        return res.status(404).json({ error: 'There is no task with this id' });
      }

      Object.keys(fieldsToUpdate).forEach((field) => {
        const updateField = Object.keys(field)[0];
        const oldValue = task[updateField as keyof typeof task];
        const newValue = field[updateField as keyof typeof field];

        if (oldValue !== newValue) {
          historyRecords.push({
            taskId: task.id,
            field: updateField,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            changedById: currentUserId,
            changedAt: new Date(),
          });
        }
      });

      if (tagsId && tagsId.length > 0) {
        // Buscar tags já existentes
        const existingTagIds = await prisma.taskTag.findMany({
          where: { taskId: Number(id) },
          select: { tagId: true },
        });
        const existingTagsInTask = existingTagIds.map((tag) => tag.tagId);

        const tagsToAdd = tagsId.filter(
          (tagId: number) => !existingTagsInTask.includes(tagId)
        );
        const tagsToRemove = existingTagsInTask.filter(
          (tagId: number) => !tagsId.includes(tagId)
        );

        // Adicionar novas tags
        if (tagsToAdd.length > 0) {
          transactions.push(
            prisma.taskTag.createMany({
              data: tagsToAdd.map((tagId: number) => ({
                taskId: Number(id),
                tagId,
              })),
            })
          );
        }

        // Remover tags que não estão mais associadas
        if (tagsToRemove.length > 0) {
          transactions.push(
            prisma.taskTag.deleteMany({
              where: {
                taskId: Number(id),
                tagId: { in: tagsToRemove },
              },
            })
          );
        }
      }

      const updatedTask = await prisma.$transaction(transactions);

      return res.status(201).json({ message: 'Task updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(400).json({ error: 'No fields to update' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const task = await prisma.task.delete({
      where: {
        id: Number(id),
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'There is no task with this id' });
    }

    return res.status(201).json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
