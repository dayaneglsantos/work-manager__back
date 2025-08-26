import { Request, Response } from 'express';
import prisma from '../services/prisma';

export const createTag = async (req: Request, res: Response): Promise<any> => {
  const { name } = req.body;

  try {
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
      },
    });

    if (existingTag) {
      return res.status(400).json({
        error: 'There is already a tag with this name.',
      });
    }

    const newTag = await prisma.tag.create({ data: { name: name } });

    return res.status(201).json(newTag);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getTagById = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const tag = await prisma.tag.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'There is no tag with this id' });
    }

    return res.status(200).json(tag);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllTags = async (req: Request, res: Response): Promise<any> => {
  try {
    const tags = await prisma.tag.findMany();

    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const updateTag = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;
  const formatedId = parseInt(id, 10);

  try {
    const existingTag = await prisma.tag.findUnique({
      where: {
        id: formatedId,
      },
    });

    if (!existingTag) {
      return res.status(400).json({
        error: 'There is no tag with this id.',
      });
    }
    if (name) {
      await prisma.tag.update({
        where: { id: formatedId },
        data: { name },
      });
    }

    return res.status(201).json({ message: 'Tag updated successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

// ----------------------------------------------------------------

export const deleteTag = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const existingTag = await prisma.tag.findUnique({
      where: {
        id: formatedId,
      },
    });

    if (!existingTag) {
      return res.status(400).json({
        error: 'There is no tag with this id.',
      });
    }

    await prisma.tag.delete({
      where: {
        id: formatedId,
      },
    });

    return res.status(201).json({ message: 'Tag deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};
