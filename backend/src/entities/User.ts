import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Item } from './Item';
import { Proposta } from './Proposta';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nome!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column()
  senha!: string;

  @Column({
    type: 'text',
    default: UserRole.USER
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Item, (item) => item.user)
  items!: Item[];

  @OneToMany(() => Proposta, (proposta) => proposta.proponente)
  propostasFeitas!: Proposta[];
}
