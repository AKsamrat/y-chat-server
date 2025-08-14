import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

export const createToken = (
    jwtPayload: Record<string, unknown>, // Ensuring a valid object type
    secret: Secret,
    expiresIn: any | number  // Accepting both string and number
) => {
    const options: SignOptions = { expiresIn };

    return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};