export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  id: string;
  role: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface RequestWithUser extends Request {
  user: JwtUser;
}

export interface AuthSignInResponse extends Tokens {
  user: JwtUser;
}
