import { Response, Request } from 'express';
import authenticateUser from '../services/authService';
import prisma from '../services/prisma';

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const token = await authenticateUser(email, password);

    if (token) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          birthDate: true,
          profileImage: true,
          employmentStatus: true,
          notes: true,
          currentPosition: true,
          currentSalary: true,
          admissionDate: true,
          profileId: true,
          supervisorId: true,
          departmentId: true,
        },
      });

      return res.status(200).json({ token, ...user });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default login;
