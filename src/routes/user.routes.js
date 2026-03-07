import express from 'express';
import {
  getAll,
  getById,
  update,
  remove,
} from '#controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '#middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorizeAdmin, getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', authorizeAdmin, remove);

export default router;
