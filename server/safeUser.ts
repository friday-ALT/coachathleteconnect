/** Fields safe to expose in API responses — never include passwordHash, tokens, etc. */
export type PublicUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  authProvider?: string | null;
};

export function toPublicUser(user: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  authProvider?: string | null;
} | null | undefined): PublicUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    authProvider: user.authProvider ?? null,
  };
}
