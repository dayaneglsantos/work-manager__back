import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';
import { CommentType } from '@prisma/client';
import { getUserIdFromToken } from '../services/getUserIdFromToken';

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { content, taskId, parentCommentId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const authorId = getUserIdFromToken(token!);

    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
    }

    // Comentário pai
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
      });

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const commentData = {
      content,
      author: { connect: { id: authorId } },
      task: taskId ? { connect: { id: taskId } } : undefined,
      ...(parentCommentId && {
        parentComment: { connect: { id: parentCommentId } },
      }),
      edited: false,
    };

    const newComment = await prisma.comment.create({
      data: commentData,
    });

    return res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getCommentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      omit: {
        authorId: true,
      },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ error: 'There is no comment with this id' });
    }

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getAllComments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        reply: {
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
          },
        },
      },
      omit: {
        authorId: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const updateComment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await prisma.comment.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
        edited: true,
      },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ error: 'There is no comment with this id' });
    }

    const updatedComment = await prisma.comment.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json(updatedComment);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.delete({
      where: {
        id: Number(id),
      },
    });

    if (!comment) {
      return res
        .status(404)
        .json({ error: 'There is no comment with this id' });
    }

    return res.status(201).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
