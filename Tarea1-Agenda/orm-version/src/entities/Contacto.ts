import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Contacto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombres!: string;

  @Column()
  apellidos!: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento!: Date;

  @Column({ nullable: true })
  direccion!: string;

  @Column({ nullable: true })
  celular!: string;

  @Column({ nullable: true })
  correo!: string;
}