import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'crypto';

// ==================================== CRYPTO ====================================== //

// Compara dois hashes de forma segura, evitando ataques de tempo.
const compareHashes = (receivedHash: string, storedHash: string): boolean => {
  // Buffer é uma estrutura de dados que representa uma sequência de bytes. Aqui, estamos convertendo os hashes hexadecimais em buffers para comparação segura.
  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  // Se os comprimentos forem diferentes, os hashes não correspondem.
  if (receivedBuffer.length !== storedBuffer.length) {
    return false;
  }

  // Evita que o tempo da comparação revele diferenças entre os hashes.
  return timingSafeEqual(receivedBuffer, storedBuffer);
};

// ==================================== CÓDIGO ====================================== //

// Gera um código criptograficamente seguro com exatamente seis dígitos.
export const generateResetCode = (): string => {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
};

// Gera o hash do código de redefinição usando HMAC com SHA-256 e um segredo.
export const hashResetCode = (code: string, secret: string): string => {
  return createHmac('sha256', secret).update(code).digest('hex');
};

// Verifica se o código fornecido corresponde ao hash armazenado usando o segredo.
export const verifyResetCode = (
  code: string,
  storedHash: string,
  secret: string
): boolean => {
  const receivedHash = hashResetCode(code, secret);
  return compareHashes(receivedHash, storedHash);
};

// ==================================== TOKEN ====================================== //

// Gera um token aleatório de 256 bits para autorizar a troca da senha.
export const generateResetToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Gera o hash do token de redefinição usando SHA-256.
export const hashResetToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

// Verifica se o token fornecido corresponde ao hash armazenado.
export const verifyResetToken = (
  token: string,
  storedHash: string
): boolean => {
  const receivedHash = hashResetToken(token);
  return compareHashes(receivedHash, storedHash);
};
