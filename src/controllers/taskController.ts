import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';
import { Prisma } from '@prisma/client';
import { getUserIdFromToken } from '../services/getUserIdFromToken';
import { buildUpdateData } from '../services/buildUpdateData';

const taskFields = [
  'title',
  'description',
  'status',
  'deadline',
  'assigneeId',
  'departmentId',
  'priority',
];

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

// ----------------------------------------------------------------

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
        blocking: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
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

// ----------------------------------------------------------------

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<any> => {
  // Filtros
  const { status, search } = req.query;

  const filters: any = {};

  if (status) {
    const statusArray = typeof status === 'string' ? status.split(',') : [];
    if (statusArray.length > 0) {
      filters.status = { in: statusArray };
    }
  }
  if (search) {
    filters.OR = [{ title: { contains: search } }];
  }

  // Paginação
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined; // Calcular o número de registros a pular
  const take = pageSize; // Número de registros a retornar

  try {
    const totalCount = await prisma.task.count({
      where: filters,
    });
    const tasks = await prisma.task.findMany({
      skip,
      take,
      where: filters,
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
        blocking: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            edited: true,
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            parentComment: {
              select: {
                id: true,
                content: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
      },
      omit: {
        assigneeId: true,
        creatorId: true,
        blockedBy: true,
        departmentId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (tasks) {
      tasks.forEach((task: any) => {
        task.tags = task.tags.map((item: any) => item.tag);
      });
    }

    let response;
    if (page && pageSize) {
      response = {
        data: tasks,
        meta: {
          page, // Página atual
          pageSize, // Tamanho da página
          totalCount, // Total de registros
          totalPages: Math.ceil(totalCount / pageSize), // Total de páginas
          hasNextPage: skip! + take! < totalCount, // Se há próxima página
          hasPreviousPage: page > 1, // Se há página anterior
        },
      };
    } else {
      response = {
        data: tasks,
        meta: {
          totalCount,
        },
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const partialUpdateTask = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { tags } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const currentUserId = getUserIdFromToken(token!);

  const fieldsToUpdate = buildUpdateData(req.body, taskFields);
  const historyRecords: Prisma.TaskHistoryCreateManyInput[] = [];

  const transactions: any[] = [];

  if (fieldsToUpdate && Object.keys(fieldsToUpdate).length > 0) {
    transactions.push(
      prisma.task.update({
        where: { id: Number(id) },
        data: fieldsToUpdate,
      })
    );
  }

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        tags: {
          select: {
            tag: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
    if (task && task.tags) {
      task.tags = task.tags.map((item: any) => item.tag.id);
    }

    if (!task) {
      return res.status(404).json({ error: 'There is no task with this id' });
    }

    if (fieldsToUpdate.length === 0 && (!tags || tags.length === 0)) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // ---- TAGS ----
    if (tags && tags.length > 0) {
      const existingTagIds = await prisma.taskTag.findMany({
        where: { taskId: Number(id) },
        select: { tagId: true },
      });
      const existingTagsInTask = existingTagIds.map((tag) => tag.tagId);

      const tagsToAdd = tags.filter(
        (tagId: number) => !existingTagsInTask.includes(tagId)
      );
      const tagsToRemove = existingTagsInTask.filter(
        (tagId: number) => !tags.includes(tagId)
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

    // ---- HISTÓRICO ----
    const formatValue = (value: any): string | null => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    };

    for (const field of Object.keys(req.body)) {
      const oldValues = task[field as keyof typeof task] as any;
      const newValues = req.body[field] as any;

      // tratamento especial para tags (salva [{id, name}, ...] no histórico)
      if (field === 'tags') {
        const oldIds: number[] = Array.isArray(oldValues) ? oldValues : [];
        const newIds: number[] = Array.isArray(newValues) ? newValues : [];

        // comparar por string para arrays
        if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
          const allIds = Array.from(new Set([...oldIds, ...newIds]));
          // busca de todas as tags para pegar os nomes
          const tags =
            allIds.length > 0
              ? await prisma.tag.findMany({
                  where: { id: { in: allIds } },
                  select: { id: true, name: true },
                })
              : [];

          const tagsWithNames = tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          }));

          const oldDetailed = oldIds.map((id) => ({
            id,
            name: tagsWithNames.find((tag) => tag.id === id)?.name ?? null,
          }));
          const newDetailed = newIds.map((id) => ({
            id,
            name: tagsWithNames.find((tag) => tag.id === id)?.name ?? null,
          }));

          historyRecords.push({
            taskId: task.id,
            field,
            oldValue: oldDetailed.length ? JSON.stringify(oldDetailed) : null,
            newValue: newDetailed.length ? JSON.stringify(newDetailed) : null,
            changedById: currentUserId,
            changedAt: new Date(),
          });
        }

        continue;
      }

      // tratamento dos demais campos
      const oldValueFormated = formatValue(oldValues);
      const newValueFormated = formatValue(newValues);

      if (oldValueFormated !== newValueFormated) {
        historyRecords.push({
          taskId: task.id,
          field,
          oldValue: oldValueFormated,
          newValue: newValueFormated,
          changedById: currentUserId,
          changedAt: new Date(),
        });
      }
    }

    // Criar registros de histórico para as alterações
    if (historyRecords.length > 0) {
      transactions.push(
        prisma.taskHistory.createMany({
          data: historyRecords,
        })
      );
    }

    await prisma.$transaction(transactions);

    const updatedTask = await prisma.task.findUnique({
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
        blocking: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
// ----------------------------------------------------------------

export const fullUpdateTask = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { assigneeId, departmentId, tagsId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const currentUserId = getUserIdFromToken(token!);

  const taskFields = [
    'title',
    'description',
    'status',
    'deadline',
    'assigneeId',
    'departmentId',
    'priority',
  ];

  const missingFields = taskFields.filter((field) => !(field in req.body));

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing fields: ${missingFields.join(', ')}`,
    });
  }

  const fieldsToUpdate = Object.keys(req.body).reduce((acc: any, key) => {
    if (taskFields.includes(key)) {
      if (key === 'assigneeId') {
        if (assigneeId === null) {
          acc['assignee'] = { disconnect: true };
        } else {
          acc['assignee'] = { connect: { id: assigneeId } };
        }
      } else if (key === 'departmentId') {
        if (departmentId === null) {
          acc['department'] = { disconnect: true };
        } else {
          acc['department'] = { connect: { id: departmentId } };
        }
      } else {
        acc[key] = req.body[key];
      }
    }
    return acc;
  }, {});

  const historyRecords: Prisma.TaskHistoryCreateManyInput[] = [];

  const transactions: any[] = [
    prisma.task.update({
      where: { id: Number(id) },
      data: fieldsToUpdate,
    }),
  ];

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'There is no task with this id' });
    }

    Object.keys(req.body).forEach((field, index) => {
      const oldValue = task[field as keyof typeof task];
      const newValue = req.body[field];

      if (oldValue !== newValue) {
        historyRecords.push({
          taskId: task.id,
          field: field,
          oldValue: oldValue ? String(oldValue) : null,
          newValue: newValue ? String(newValue) : null,
          changedById: currentUserId,
          changedAt: new Date(),
        });
      }
    });

    // Criar registros de histórico para as alterações
    if (historyRecords.length > 0) {
      transactions.push(
        prisma.taskHistory.createMany({
          data: historyRecords,
        })
      );
    }

    // Buscar tags já existentes
    const existingTagIds = await prisma.taskTag.findMany({
      where: { taskId: Number(id) },
      select: { tagId: true },
    });
    const existingTagsInTask = existingTagIds.map((tag) => tag.tagId);

    const tagsToAdd = tagsId.filter(
      (tagId: number) => !existingTagsInTask.includes(tagId)
    );

    for (const tag of tagsToAdd) {
      const existing = await prisma.tag.findUnique({ where: { id: tag } });
      if (!existing) {
        return res.status(404).json({ error: `Tag with id ${tag} not found` });
      }
    }

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

    const updatedTask = await prisma.$transaction(transactions);

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

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
