import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha, role } = req.body;

      // Validações
      if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      }

      // Verificar se usuário já existe
      const userExists = await userRepository.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ message: 'Usuário já existe' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Criar usuário
      const user = userRepository.create({
        nome,
        email,
        senha: hashedPassword,
        role: role || UserRole.USER
      });

      await userRepository.save(user);

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar usuário' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      // Validações
      if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(senha, user.senha);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remover senha da resposta
      const { senha: _, ...userWithoutPassword } = user;

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao fazer login' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const { senha: _, ...userWithoutPassword } = user;

      return res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  }
}
