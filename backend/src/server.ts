import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from './database/data-source';
import { router } from './routes';
import { apiLimiter } from './middlewares/rateLimit.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter para todas as rotas da API
app.use('/api', apiLimiter);

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rotas
app.use('/api', router);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'TrocaTudo API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      propostas: '/api/propostas',
      users: '/api/users',
      categories: '/api/categories',
      ratings: '/api/ratings'
    }
  });
});

// Inicializar banco de dados e servidor
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Banco de dados conectado');

    // Popular categorias iniciais se não existirem
    const categoryRepo = AppDataSource.getRepository('Category');
    const count = await categoryRepo.count();
    if (count === 0) {
        console.log('Populando categorias iniciais...');
        await categoryRepo.save([
            { name: 'Eletrônicos', slug: 'eletronicos' },
            { name: 'Vestuário', slug: 'vestuario' },
            { name: 'Móveis', slug: 'moveis' },
            { name: 'Livros', slug: 'livros' },
            { name: 'Esportes', slug: 'esportes' },
            { name: 'Outros', slug: 'outros' },
        ]);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
  });