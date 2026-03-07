import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/user.service.js';
import { formatValidationError } from '#utils/format.js';
import {
  updateUserSchema,
  userIdParamSchema,
} from '#validations/user.validations.js';

export const getAll = async (req, res, next) => {
  try {
    const usersList = await getAllUsers();

    res.status(200).json({ users: usersList });
  } catch (error) {
    logger.error('Error fetching users', error);
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const paramResult = userIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramResult.error),
      });
    }

    const user = await getUserById(paramResult.data.id);

    res.status(200).json({ user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.error('Error fetching user', error);
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const paramResult = userIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramResult.error),
      });
    }

    const bodyResult = updateUserSchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyResult.error),
      });
    }

    if (Object.keys(bodyResult.data).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = await updateUser(paramResult.data.id, bodyResult.data);

    logger.info(`User ${user.id} updated successfully`);

    res.status(200).json({ user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error.message === 'Email already in use') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    logger.error('Error updating user', error);
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const paramResult = userIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramResult.error),
      });
    }

    await deleteUser(paramResult.data.id);

    logger.info(`User ${paramResult.data.id} deleted successfully`);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.error('Error deleting user', error);
    next(error);
  }
};
