import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Item, ItemStatus, ItemCategoria } from '../entities/Item';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../entities/User';

const itemRepository = AppDataSource.getRepository(Item);

export class ItemController {
  // Listar todos os itens (público) - com paginação e filtros
  async index(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const categoria = req.query.categoria as ItemCategoria;
      const status = req.query.status as ItemStatus;

      const skip = (page - 1) * limit;

      const where: any = {};
      if (categoria) where.categoria = categoria;
      if (status) where.status = status;

      const [items, total] = await itemRepository.findAndCount({
        where,
        relations: ['user'],
        select: {
          user: {
            id: true,
            nome: true,
            email: true
          }
        },
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      });

      return res.json({
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar itens' });
    }
  }

  // Buscar item por ID (público)
  async show(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const item = await itemRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['user'],
        select: {
          user: {
            id: true,
            nome: true,
            email: true
          }
        }
      });

      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }

      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao buscar item' });
    }
  }

  // Criar item (autenticado)
  async create(req: AuthRequest, res: Response) {
    try {
      const { titulo, descricao, categoria, fotos, imagens } = req.body;
      const userId = req.user!.id;

      if (!titulo || !descricao) {
        return res.status(400).json({ message: 'Título e descrição são obrigatórios' });
      }

      const item = itemRepository.create({
        titulo,
        descricao,
        categoria: categoria || ItemCategoria.OUTROS,
        fotos,
        imagens,
        userId,
        status: ItemStatus.DISPONIVEL
      });

      await itemRepository.save(item);

      return res.status(201).json({
        message: 'Item criado com sucesso',
        item
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar item' });
    }
  }

  // Atualizar item (dono ou moderador/admin)
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, categoria, fotos, imagens, status } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const item = await itemRepository.findOne({ where: { id: parseInt(id) } });

      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }

      // Verifica permissão
      if (item.userId !== userId && userRole === UserRole.USER) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este item' });
      }

      if (titulo) item.titulo = titulo;
      if (descricao) item.descricao = descricao;
      if (categoria) item.categoria = categoria;
      if (fotos !== undefined) item.fotos = fotos;
      if (imagens !== undefined) item.imagens = imagens;
      if (status) item.status = status;

      await itemRepository.save(item);

      return res.json({
        message: 'Item atualizado com sucesso',
        item
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar item' });
    }
  }

  // Deletar item (dono ou moderador/admin)
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const item = await itemRepository.findOne({ where: { id: parseInt(id) } });

      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }

      // Verifica permissão
      if (item.userId !== userId && userRole === UserRole.USER) {
        return res.status(403).json({ message: 'Você não tem permissão para deletar este item' });
      }

      await itemRepository.remove(item);

      return res.json({ message: 'Item deletado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao deletar item' });
    }
  }

  // Listar meus itens (autenticado)
  async myItems(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const items = await itemRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      return res.json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar seus itens' });
    }
  }

  // Upload de imagens para um item (novo método)
  async uploadImages(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      const item = await itemRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      
      // Verificar permissão
      if (item.userId !== req.user!.id && req.user!.role === UserRole.USER) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este item' });
      }
      
      // Processar arquivos
      const imagePaths = files.map(file => `/uploads/${file.filename}`);
      
      // Atualizar item com novos caminhos de imagem
      item.imagens = item.imagens ? [...item.imagens, ...imagePaths] : imagePaths;
      await itemRepository.save(item);
      
      return res.json({
        message: 'Imagens enviadas com sucesso',
        imagens: item.imagens
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao enviar imagens' });
    }
  }

  // Remover uma imagem de um item (novo método)
  async removeImage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { imageIndex } = req.body;
      
      if (imageIndex === undefined) {
        return res.status(400).json({ message: 'Índice da imagem é obrigatório' });
      }
      
      const item = await itemRepository.findOne({ where: { id: parseInt(id) } });
      
      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      
      // Verificar permissão
      if (item.userId !== req.user!.id && req.user!.role === UserRole.USER) {
        return res.status(403).json({ message: 'Você não tem permissão para editar este item' });
      }
      
      // Verificar se o índice é válido
      if (!item.imagens || imageIndex < 0 || imageIndex >= item.imagens.length) {
        return res.status(400).json({ message: 'Índice de imagem inválido' });
      }
      
      // Remover a imagem do array
      const removedImage = item.imagens[imageIndex];
      item.imagens.splice(imageIndex, 1);
      await itemRepository.save(item);
      
      // Opcional: remover o arquivo físico
      // const filePath = path.join(__dirname, '../../', removedImage);
      // if (fs.existsSync(filePath)) {
      //   fs.unlinkSync(filePath);
      // }
      
      return res.json({
        message: 'Imagem removida com sucesso',
        imagens: item.imagens
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao remover imagem' });
    }
  }
}
