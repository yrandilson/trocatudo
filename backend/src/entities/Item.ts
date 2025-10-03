import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Proposta } from './Proposta';

export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  TROCADO = 'trocado'
}

export enum ItemCategoria {
  ELETRONICOS = 'eletronicos',
  VESTUARIO = 'vestuario',
  MOVEIS = 'moveis',
  LIVROS = 'livros',
  ESPORTES = 'esportes',
  OUTROS = 'outros'
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  titulo!: string;

  @Column('text')
  descricao!: string;

  @Column({
    type: 'text',
    default: ItemCategoria.OUTROS
  })
  categoria!: ItemCategoria;

  @Column({ type: 'text', nullable: true })
  fotos?: string; // Mantido para compatibilidade com código existente

  @Column('simple-array', { nullable: true })
  imagens?: string[]; // Novo campo para armazenar múltiplas imagens

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
