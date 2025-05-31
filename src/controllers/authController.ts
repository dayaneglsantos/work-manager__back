import { Response, Request } from 'express';
import authenticateUser from '../services/authService';
import User from '../models/userModel';

const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const token = await authenticateUser(email, password);
    console.log('token no authController', token);
    if (token) {
      const user = await User.getUserSession(email);
      console.log('user após o getUserSession', user);
      return res.status(200).json({ token, ...user });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.log('erro no authController', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default login;
