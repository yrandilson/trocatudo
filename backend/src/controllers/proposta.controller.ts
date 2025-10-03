import { Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Proposta, PropostaStatus } from '../entities/Proposta';
import { Item, ItemStatus } from '../entities/Item';
import { AuthRequest } from '../middlewares/auth.middleware';

const propostaRepository = AppDataSource.getRepository(Proposta);
const itemRepository = AppDataSource.getRepository(Item);

export class PropostaController {
  // Criar proposta (autenticado)
  async create(req: AuthRequest, res: Response) {
    try {
      const { itemId, mensagem } = req.body;
      const proponenteId = req.user!.id;

      if (!itemId) {
        return res.status(400).json({ message: 'Item ID é obrigatório' });
      }

      // Verificar se o item existe e está disponível
      const item = await itemRepository.findOne({ where: { id: itemId } });

      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }

      if (item.status !== ItemStatus.DISPONIVEL) {
        return res.status(400).json({ message: 'Item não está disponível para troca' });
      }

      // Não pode fazer proposta para seu próprio item
      if (item.userId === proponenteId) {
        return res.status(400).json({ message: 'Você não pode fazer proposta para seu próprio item' });
      }

      // Verificar se já existe proposta pendente deste usuário para este item
      const propostaExistente = await propostaRepository.findOne({
        where: {
          proponenteId,
          itemId,
          status: PropostaStatus.PENDENTE
        }
      });

      if (propostaExistente) {
        return res.status(400).json({ message: 'Você já tem uma proposta pendente para este item' });
      }

      const proposta = propostaRepository.create({
        proponenteId,
        itemId,
        mensagem,
        status: PropostaStatus.PENDENTE
      });

      await propostaRepository.save(proposta);

      return res.status(201).json({
        message: 'Proposta criada com sucesso',
        proposta
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar proposta' });
    }
  }

  // Listar propostas recebidas (dono do item)
  async received(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const propostas = await propostaRepository
        .createQueryBuilder('proposta')
        .leftJoinAndSelect('proposta.proponente', 'proponente')
        .leftJoinAndSelect('proposta.item', 'item')
        .where('item.userId = :userId', { userId })
        .orderBy('proposta.createdAt', 'DESC')
        .getMany();

      return res.json(propostas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar propostas recebidas' });
    }
  }

  // Listar propostas feitas (proponente)
  async sent(req: AuthRequest, res: Response) {
    try {
      const proponenteId = req.user!.id;

      const propostas = await propostaRepository.find({
        where: { proponenteId },
        relations: ['item', 'item.user'],
        order: { createdAt: 'DESC' }
      });

      return res.json(propostas);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao listar propostas enviadas' });
    }
  }

  // Atualizar status da proposta (dono do item)
  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      if (!status || ![PropostaStatus.ACEITA, PropostaStatus.RECUSADA].includes(status)) {
        return res.status(400).json({ message: 'Status inválido' });
      }

      const proposta = await propostaRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['item']
      });

      if (!proposta) {
        return res.status(404).json({ message: 'Proposta não encontrada' });
      }

      // Verificar se o usuário é o dono do item
      if (proposta.item.userId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para atualizar esta proposta' });
      }

      // Não pode atualizar proposta que não está pendente
      if (proposta.status !== PropostaStatus.PENDENTE) {
        return res.status(400).json({ message: 'Esta proposta já foi processada' });
      }

      proposta.status = status;
      await propostaRepository.save(proposta);

      // Se aceita, marcar item como trocado
      if (status === PropostaStatus.ACEITA) {
        proposta.item.status = ItemStatus.TROCADO;
        await itemRepository.save(proposta.item);

        // Recusar todas as outras propostas pendentes para este item
        await propostaRepository
          .createQueryBuilder()
          .update(Proposta)
          .set({ status: PropostaStatus.RECUSADA })
          .where('itemId = :itemId', { itemId: proposta.itemId })
          .andWhere('id != :propostaId', { propostaId: proposta.id })
          .andWhere('status = :status', { status: PropostaStatus.PENDENTE })
          .execute();
      }

      return res.json({
        message: 'Proposta atualizada com sucesso',
        proposta
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar proposta' });
    }
  }

  // Deletar proposta (proponente ou admin)
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const proposta = await propostaRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!proposta) {
        return res.status(404).json({ message: 'Proposta não encontrada' });
      }

      // Apenas o proponente pode deletar sua proposta
      if (proposta.proponenteId !== userId) {
        return res.status(403).json({ message: 'Você não tem permissão para deletar esta proposta' });
      }

      await propostaRepository.remove(proposta);

      return res.json({ message: 'Proposta deletada com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao deletar proposta' });
    }
  }
}
