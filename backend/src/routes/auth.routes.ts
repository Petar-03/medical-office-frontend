import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export function createAuthRoutes(authController: AuthController): Router {
  const authRoutes = Router();

  authRoutes.post('/register', authController.register);
  authRoutes.post('/login', authController.login);
  authRoutes.post('/logout', authController.logout);

  return authRoutes;
}
