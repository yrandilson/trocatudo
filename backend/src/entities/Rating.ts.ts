import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './User';
import { Proposta } from './Proposta';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  score!: number; // e.g., 1 to 5

  @Column('text', { nullable: true })
  comment?: string;

  @Column()
  ratedByUserId!: number; // Quem avaliou

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ratedByUserId' })
  ratedByUser!: User;

  @Column()
  ratedUserId!: number; // Quem foi avaliado

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ratedUserId' })
  ratedUser!: User;

  @Column()
  propostaId!: number;

  @OneToOne(() => Proposta)
  @JoinColumn({ name: 'propostaId' })
  proposta!: Proposta;

  @CreateDateColumn()
  createdAt!: Date;
}