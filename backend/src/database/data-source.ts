import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Proposta } from '../entities/Proposta';
import { Category } from '../entities/Category';
import { Rating } from '../entities/Rating';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true, // Em produção, usar migrations
  logging: false,
  entities: [User, Item, Proposta, Category, Rating], // Adicionado Category e Rating
  migrations: [],
  subscribers: []
});