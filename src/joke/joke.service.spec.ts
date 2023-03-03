import { Test, TestingModule } from '@nestjs/testing';
import { JokeService } from './joke.service';
import { getModelToken } from '@nestjs/mongoose';
import { Joke, JokeSchema } from './schemas/joke.schema';

describe('JokeService', () => {
  let service: JokeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JokeService, {
        provide: getModelToken(Joke.name),
        useValue: JokeSchema,
      },],
    }).compile();

    service = module.get<JokeService>(JokeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
