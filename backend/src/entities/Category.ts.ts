import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Item } from './Item';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @OneToMany(() => Item, (item) => item.category)
  items!: Item[];
}