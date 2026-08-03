import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';

export const createTaskHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { taskId, field, oldValue, newValue } = req.body;

  try {
    const changedById = req.user!.userId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        error: `There is no task with that id`,
      });
    }

    const taskHistoryData = {
      task: { connect: { id: taskId } },
      field,
      oldValue,
      newValue,
      changedBy: { connect: { id: changedById } },
    };

    const newTaskHistory = await prisma.taskHistory.create({
      data: taskHistoryData,
    });

    return res.status(201).json(newTaskHistory);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getTaskHistoryById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const taskHistory = await prisma.taskHistory.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!taskHistory) {
      return res
        .status(404)
        .json({ error: 'There is no task history with this id' });
    }

    return res.status(200).json(taskHistory);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getAllTaskHistories = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { taskId } = req.query;

  const filters: any = {};

  if (taskId) {
    filters.taskId = Number(taskId);
  }

  try {
    const taskHistories = await prisma.taskHistory.findMany({
      where: filters,
    });

    return res.status(200).json(taskHistories);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
