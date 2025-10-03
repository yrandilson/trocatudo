// backend/src/entities/Message.ts
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  senderId!: number;

  @Column()
  receiverId!: number;

  @Column()
  itemId!: number;

  @Column('text')
  content!: string;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}