import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DATABASE_DATA_SOURCE } from '../database/database.module.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo } from './entities/todo.entity.js';

@Injectable()
export class TodosService {
  private readonly todos: Repository<Todo>;

  constructor(
    @Inject(DATABASE_DATA_SOURCE) dataSource: DataSource,
  ) {
    this.todos = dataSource.getRepository(Todo);
  }

  create(createTodoDto: CreateTodoDto) {
    const todo = this.todos.create({
      title: createTodoDto.title.trim(),
      status: createTodoDto.status ?? 'TODO',
    });
    return this.todos.save(todo);
  }

  findAll() {
    return this.todos.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const todo = await this.todos.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    Object.assign(todo, updateTodoDto);
    if (updateTodoDto.title !== undefined) {
      todo.title = updateTodoDto.title.trim();
    }
    return this.todos.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.todos.remove(todo);
  }
}
