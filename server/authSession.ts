import type { Request } from 'express';
import { signToken } from './jwt';
import { getTokenVersion } from './tokenVersion';

export type AuthUserRef = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  tokenVersion?: number | null;
};

export function signUserToken(user: AuthUserRef): string {
  return signToken(
    {
      sub: user.id,
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    },
    user.tokenVersion ?? 0,
  );
}

/** Bind email-auth cookie session; stores token version for cross-platform invalidation. */
export async function bindAuthSession(req: Request, user: AuthUserRef): Promise<void> {
  const tokenVersion =
    user.tokenVersion ?? (await getTokenVersion(user.id));

  const session = req.session as {
    userId?: string;
    user?: AuthUserRef;
    tokenVersion?: number;
  };

  session.userId = user.id;
  session.user = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
  session.tokenVersion = tokenVersion;
}
