import jwt from 'jsonwebtoken';

export function getUserIdFromToken(token: string) {
  try {
    // Verifica se o token é válido e decodifica-o
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    // Retorna o ID do usuário contido no token
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
