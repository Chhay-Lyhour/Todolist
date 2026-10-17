import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

@Entity({ name: 'todos' })
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ default: 'TODO' })
  status: TodoStatus;
}
