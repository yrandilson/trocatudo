import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Rating } from '../entities/Rating';
import { Proposta, PropostaStatus } from '../entities/Proposta';
import { AuthRequest } from '../middlewares/auth.middleware';

const ratingRepository = AppDataSource.getRepository(Rating);
const propostaRepository = AppDataSource.getRepository(Proposta);

export class RatingController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { propostaId, score, comment } = req.body;
      const ratedByUserId = req.user!.id;

      if (!propostaId || !score) {
        return res.status(400).json({ message: 'Proposta ID e score são obrigatórios' });
      }

      const proposta = await propostaRepository.findOne({
        where: { id: propostaId },
        relations: ['item', 'proponente'],
      });

      if (!proposta || proposta.status !== PropostaStatus.ACEITA) {
        return res.status(400).json({ message: 'Só é possível avaliar propostas aceitas.' });
      }
      
      const existingRating = await ratingRepository.findOne({ where: { propostaId } });
      if (existingRating) {
          return res.status(400).json({ message: 'Esta proposta já foi avaliada.' });
      }

      // Determina quem está sendo avaliado
      let ratedUserId: number;
      if (proposta.proponenteId === ratedByUserId) {
          // Proponente está avaliando o dono do item
          ratedUserId = proposta.item.userId;
      } else if (proposta.item.userId === ratedByUserId) {
          // Dono do item está avaliando o proponente
          ratedUserId = proposta.proponenteId;
      } else {
          return res.status(403).json({ message: 'Você não tem permissão para avaliar esta proposta.' });
      }

      const rating = ratingRepository.create({
        propostaId,
        score,
        comment,
        ratedByUserId,
        ratedUserId,
      });

      await ratingRepository.save(rating);

      return res.status(201).json(rating);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar avaliação' });
    }
  }

  async getUserRatings(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const ratings = await ratingRepository.find({
            where: { ratedUserId: parseInt(id) },
            relations: ['ratedByUser'],
            order: { createdAt: 'DESC' }
        });

        return res.json(ratings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar avaliações do usuário' });
    }
  }
}