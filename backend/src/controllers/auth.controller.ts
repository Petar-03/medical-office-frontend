import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const session = await this.authService.registerDoctor(req.body);
    res.status(201).json({ message: 'Doctor registered', data: session });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const session = await this.authService.loginDoctor(req.body);
    res.json({ message: 'Doctor logged in', data: session });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = this.getToken(req);
    await this.authService.logout(token);
    res.json({ message: 'Doctor logged out' });
  };

  private getToken(req: Request): string {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }

    return String(req.body.token || '');
  }
}
