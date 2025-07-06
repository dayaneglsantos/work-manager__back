import { NextFunction, Request, Response } from 'express';
import hashPassword from '../services/hashService';
import prisma from '../services/prisma';
import { CommentType } from '@prisma/client';
import { getUserIdFromToken } from '../services/getUserIdFromToken';

export const createTaskHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { taskId, field, oldValue, newValue } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    const changedById = getUserIdFromToken(token!);

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
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
// export const getCommentById = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;

//   try {
//     const comment = await prisma.comment.findUnique({
//       where: {
//         id: Number(id),
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//       omit: {
//         authorId: true,
//       },
//     });

//     if (!comment) {
//       return res
//         .status(404)
//         .json({ error: 'There is no comment with this id' });
//     }

//     return res.status(200).json(comment);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
// export const getAllComments = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const users = await prisma.comment.findMany({
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//       omit: {
//         authorId: true,
//       },
//     });

//     return res.status(200).json(users);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const updateComment = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;
//   const { content } = req.body;

//   try {
//     const comment = await prisma.comment.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         content,
//         edited: true,
//       },
//     });

//     if (!comment) {
//       return res
//         .status(404)
//         .json({ error: 'There is no comment with this id' });
//     }

//     return res.status(201).json({ message: 'Comment updated successfully' });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// export const deleteComment = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   const { id } = req.params;

//   try {
//     const comment = await prisma.comment.delete({
//       where: {
//         id: Number(id),
//       },
//     });

//     if (!comment) {
//       return res
//         .status(404)
//         .json({ error: 'There is no comment with this id' });
//     }

//     return res.status(201).json({ message: 'Comment deleted successfully' });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
