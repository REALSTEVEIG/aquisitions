import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';

const USER_COLUMNS = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    return await db.select(USER_COLUMNS).from(users);
  } catch (error) {
    logger.error('Error fetching users', error);
    throw new Error('Error fetching users', { cause: error });
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select(USER_COLUMNS)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error(`Error fetching user ${id}`, error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('User not found');
    }

    if (data.email) {
      const [duplicate] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (duplicate && duplicate.id !== id) {
        throw new Error('Email already in use');
      }
    }

    const [updated] = await db
      .update(users)
      .set({ ...data, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning(USER_COLUMNS);

    return updated;
  } catch (error) {
    logger.error(`Error updating user ${id}`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    logger.error(`Error deleting user ${id}`, error);
    throw error;
  }
};
