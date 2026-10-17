import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_DATA_SOURCE } from '../database/database.module.js';
import { TodosService } from './todos.service.js';

describe('TodosService', () => {
  let service: TodosService;
  const repository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOneBy: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: DATABASE_DATA_SOURCE,
          useValue: { getRepository: () => repository },
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
