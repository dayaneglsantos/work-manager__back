import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';
import { CommentType } from '@prisma/client';
import { getUserIdFromToken } from '../services/getUserIdFromToken';

// Atalho - Select para incluir informações do usuário mencionado
const mentionUserSelect = {
  select: {
    user: {
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    },
  },
};

// Atalho - Função que "achata" as menções de um comentário, retornando apenas os usuários mencionados
const flattenMentions = (comment: any) => {
  if (comment?.commentMentions) {
    comment.commentMentions = comment.commentMentions.map((m: any) => m.user);
  }
  return comment;
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { content, taskId, parentCommentId, mentionedUserIds } = req.body;
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

    // Menções
    // Remove duplicatas do array de IDs mencionados
    const uniqueMentionedIds: number[] = mentionedUserIds
      ? Array.from(new Set(mentionedUserIds))
      : [];

    // Busca os usuários mencionados no banco de dados para garantir que eles existem
    if (uniqueMentionedIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: uniqueMentionedIds } },
        select: { id: true },
      });

      // Verifica se todos os usuários mencionados existem
      if (existingUsers.length !== uniqueMentionedIds.length) {
        return res
          .status(400)
          .json({ error: 'One or more mentioned users do not exist' });
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
      // Criando menções de usuários, se houver
      ...(uniqueMentionedIds.length > 0 && {
        commentMentions: {
          create: uniqueMentionedIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      }),
    };

    const newComment = await prisma.comment.create({
      data: commentData,
      include: {
        commentMentions: mentionUserSelect,
      },
    });

    return res.status(201).json(flattenMentions(newComment));
  } catch (error) {
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
        commentMentions: mentionUserSelect,
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

    return res.status(200).json(flattenMentions(comment));
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
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        commentMentions: mentionUserSelect,
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
            commentMentions: mentionUserSelect,
          },
        },
      },
      omit: {
        authorId: true,
      },
    });

    comments.forEach((comment: any) => {
      flattenMentions(comment);
      comment.reply?.forEach(flattenMentions);
    });

    return res.status(200).json(comments);
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
  const { content, mentionedUserIds } = req.body;
  const commentId = Number(id);

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res
        .status(404)
        .json({ error: 'There is no comment with this id' });
    }

    const transactions: any[] = [
      prisma.comment.update({
        where: { id: commentId },
        data: {
          content,
          edited: true,
        },
      }),
    ];

    // ---- MENÇÕES ----
    if (mentionedUserIds !== undefined) {
      // Remove duplicatas do array de IDs mencionados
      const uniqueMentionedIds: number[] = Array.from(
        new Set(mentionedUserIds)
      );

      if (uniqueMentionedIds.length > 0) {
        const existingUsers = await prisma.user.findMany({
          where: { id: { in: uniqueMentionedIds } },
          select: { id: true },
        });

        if (existingUsers.length !== uniqueMentionedIds.length) {
          return res
            .status(400)
            .json({ error: 'One or more mentioned users do not exist' });
        }
      }

      const existingMentions = await prisma.commentMention.findMany({
        where: { commentId },
        select: { userId: true },
      });
      const existingMentionedIds = existingMentions.map((m) => m.userId);

      const idsToAdd = uniqueMentionedIds.filter(
        (userId) => !existingMentionedIds.includes(userId)
      );
      const idsToRemove = existingMentionedIds.filter(
        (userId) => !uniqueMentionedIds.includes(userId)
      );

      if (idsToAdd.length > 0) {
        transactions.push(
          prisma.commentMention.createMany({
            data: idsToAdd.map((userId) => ({ commentId, userId })),
          })
        );
      }

      if (idsToRemove.length > 0) {
        transactions.push(
          prisma.commentMention.deleteMany({
            where: { commentId, userId: { in: idsToRemove } },
          })
        );
      }
    }

    await prisma.$transaction(transactions);

    const updatedComment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        commentMentions: mentionUserSelect,
      },
    });

    return res.json(flattenMentions(updatedComment));
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
