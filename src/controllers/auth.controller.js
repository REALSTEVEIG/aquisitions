import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { formatValidationError } from '#utils/format.js';
import { signinSchema, signupSchema } from '#validations/auth.validations.js';
import jwtToken from '#utils/jwt';
import cookies from '#utils/cookies.js';

export const signUp = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);

    if (error.message === 'User with email exists') {
      return res.status(409).json({ error: 'Email exists' });
    }

    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwtToken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signin error', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');

    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    logger.error('Signout error', error);
    next(error);
  }
};
