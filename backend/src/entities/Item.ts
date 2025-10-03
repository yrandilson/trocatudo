import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Proposta } from './Proposta';
import { Category } from './Category';

export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  TROCADO = 'trocado'
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column('text')
  descricao!: string;
  
  @Column()
  categoryId!: number;

  @ManyToOne(() => Category, (category) => category.items)
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Column('simple-array', { nullable: true })
  imagens?: string[];

  @Column({
    type: 'text',
    default: ItemStatus.DISPONIVEL
  })
  status!: ItemStatus;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Proposta, (proposta) => proposta.item)
  propostas!: Proposta[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}