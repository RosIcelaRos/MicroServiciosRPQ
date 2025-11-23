import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  placa!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  tipo!: string;

  @Column({ type: 'integer', nullable: false })
  capacidad!: number;

   @Column({ type: 'varchar', length: 255, nullable: false })
  estado!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}