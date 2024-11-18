import { describe, it, expect } from 'vitest';
import hashPassword from '../services/hashService';

describe('Transforma normal password to hashed', () => {
  it('should transform password to hashed', () => {
    const normalPassword = 'teste123';
    const hashedPassword = hashPassword(normalPassword);
    expect(hashedPassword).not.toBe(normalPassword);
  });
});
