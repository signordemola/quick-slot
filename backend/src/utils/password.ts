import * as argon from 'argon2';

export const hashPassword = async (password: string): Promise<string> =>
  await argon.hash(password);

export const verifyPassword = async (
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> => await argon.verify(hashedPassword, plainPassword);
