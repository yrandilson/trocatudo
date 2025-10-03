import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User, UserRole } from '../entities/User';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

const userRepository = AppDataSource.getRepository(User);

export class UserController {
  // Listar todos os usuários (admin)
  async index(req: AuthRequest, res: Response) {
    try {
      const users = await userRepository.find({
        select: ['id', 'nome', 'email', 'role', 'createdAt', 'updatedAt'],
        order: { createdAt: 'DESC' }
      });

      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar usuários' });
    }
  }

  // Buscar usuário por ID (admin)
  async show(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await userRepository.findOne({
        where: { id: parseInt(id) },
        select: ['id', 'nome', 'email', 'role', 'createdAt', 'updatedAt']
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  }

  // Atualizar usuário (admin)
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, senha, role } = req.body;

      const user = await userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar se email já está em uso por outro usuário
      if (email && email !== user.email) {
        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email já está em uso' });
        }
        user.email = email;
      }

      if (nome) user.nome = nome;
      if (role) user.role = role;
      
      if (senha) {
        user.senha = await bcrypt.hash(senha, 10);
      }

      await userRepository.save(user);

      const { senha: _, ...userWithoutPassword } = user;

      return res.json({
        message: 'Usuário atualizado com sucesso',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  }

  // Deletar usuário (admin)
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await userRepository.findOne({ where: { id: parseInt(id) } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Não permitir que admin delete a si mesmo
      if (user.id === req.user!.id) {
        return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
      }

      await userRepository.remove(user);

      return res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
  }
}
