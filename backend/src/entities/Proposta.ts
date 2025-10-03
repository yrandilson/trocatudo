import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { Item } from './Item';
import { Rating } from './Rating'; // Importar Rating

export enum PropostaStatus {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada'
}

@Entity('propostas')
export class Proposta {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  proponenteId!: number;

  @ManyToOne(() => User, (user) => user.propostasFeitas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proponenteId' })
  proponente!: User;

  @Column()
  itemId!: number;

  @ManyToOne(() => Item, (item) => item.propostas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @Column('text', { nullable: true })
  mensagem?: string;

  @Column({
    type: 'text',
    default: PropostaStatus.PENDENTE
  })
  status!: PropostaStatus;
  
  // Nova Relação
  @OneToOne(() => Rating, rating => rating.proposta)
  rating!: Rating;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}