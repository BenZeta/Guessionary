import jwt, { JwtPayload } from 'jsonwebtoken';

const secretKey = 'password';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secretKey);
}

export function verifyToken(token: string): string | JwtPayload {
  return jwt.verify(token, secretKey);
}
