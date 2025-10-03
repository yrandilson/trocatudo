// backend/src/entities/Location.ts
@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  itemId!: number;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  zipCode?: string;
}