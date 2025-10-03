// backend/src/entities/RefreshToken.ts
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  token!: string;

  @Column()
  userId!: number;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}