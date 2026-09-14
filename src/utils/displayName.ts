interface DisplayNamePerson {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  role?: string | null;
}

/**
 * Admin accounts are typically generic service logins with no real name/email,
 * so the raw username shouldn't leak into the UI — show a role label instead.
 */
export const displayName = (person: DisplayNamePerson, adminLabel: string, fallback: string) =>
  person.name || (person.role === 'ADMIN' ? adminLabel : null) || person.email || person.username || fallback;
