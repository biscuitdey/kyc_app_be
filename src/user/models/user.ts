import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  validated: boolean;

  @Column({ default: 'Pending verification' })
  bankStatus?: string;

  @Column({ default: 'Pending verification' })
  panStatus?: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
