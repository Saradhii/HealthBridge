import { db } from '../db';
import { passwordHistory } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyPassword } from './password';

const PASSWORD_HISTORY_LIMIT = 3;

export const checkPasswordHistory = async (
  userId: string,
  newPassword: string
): Promise<boolean> => {
  const history = await db.query.passwordHistory.findMany({
    where: eq(passwordHistory.userId, userId),
    orderBy: [desc(passwordHistory.createdAt)],
    limit: PASSWORD_HISTORY_LIMIT,
  });

  for (const record of history) {
    const isMatch = await verifyPassword(newPassword, record.passwordHash);
    if (isMatch) {
      return false;
    }
  }

  return true;
};

export const addToPasswordHistory = async (
  userId: string,
  passwordHash: string
): Promise<void> => {
  await db.insert(passwordHistory).values({
    userId,
    passwordHash,
  });
};
