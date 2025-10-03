import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Category } from '../entities/Category';

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryController {
  async index(req: Request, res: Response) {
    try {
      const categories = await categoryRepository.find();
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar categorias' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, slug } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: 'Nome e slug são obrigatórios' });
      }
      const category = categoryRepository.create({ name, slug });
      await categoryRepository.save(category);
      return res.status(201).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar categoria' });
    }
  }
}