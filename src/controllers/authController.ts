import { Response, Request } from 'express';
import authenticateUser from '../services/authService';

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const token = await authenticateUser(email, password);

    if (token) {
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default login;
