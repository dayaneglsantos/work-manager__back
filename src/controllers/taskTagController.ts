import { Request, Response } from 'express';
import prisma from '../services/prisma';

export const createTaskTag = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { taskId, tagId } = req.body;

  try {
    const existingTagOnTask = await prisma.taskTag.findFirst({
      where: {
        taskId: taskId,
        tagId: tagId,
      },
    });

    if (existingTagOnTask) {
      return res.status(400).json({
        error: 'This tag is already associated with that task.',
      });
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
    if (!existingTask) {
      return res.status(404).json({ error: 'There is no task with that id' });
    }
    const existingTag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });
    if (!existingTag) {
      return res.status(404).json({ error: 'There is no tag with that id' });
    }

    const newTagOnTask = await prisma.taskTag.create({
      data: {
        taskId: taskId,
        tagId: tagId,
      },
    });

    return res.status(201).json(newTagOnTask);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getTaskTagById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const taskTag = await prisma.taskTag.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      omit: {
        taskId: true,
        tagId: true,
      },
    });

    if (!taskTag) {
      return res
        .status(404)
        .json({ error: 'There is no task tag with this id' });
    }

    return res.status(200).json(taskTag);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getAllTasksTags = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const tags = await prisma.taskTag.findMany({
      include: {
        task: {
          select: {
            title: true,
          },
        },
        tag: {
          select: {
            name: true,
          },
        },
      },
      omit: {
        taskId: true,
        tagId: true,
      },
    });

    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const deleteTaskTag = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const existingTaskTag = await prisma.taskTag.findUnique({
      where: {
        id: formatedId,
      },
    });

    if (!existingTaskTag) {
      return res.status(400).json({
        error: 'There is no record with this id.',
      });
    }

    await prisma.taskTag.delete({
      where: {
        id: formatedId,
      },
    });

    return res.status(201).json({ message: 'Task tag deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};
