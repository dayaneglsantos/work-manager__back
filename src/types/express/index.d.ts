import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: any; // Substitua `any` pelo tipo correto do usuário, se tiver um modelo definido.
  }
}
