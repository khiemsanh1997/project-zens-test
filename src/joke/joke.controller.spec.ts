
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JokeController } from './joke.controller';
import { JokeService } from './joke.service';
import { CreateJokeDto } from './dto/create-joke.dto';
import { UpdateJokeDto } from './dto/update-joke.dto';
import { Joke, JokeDocument, JokeSchema } from './schemas/joke.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
describe('JokeController', () => {
  let jokeController: JokeController;
  let jokeService: JokeService;
  let jokeModel: Model<JokeDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JokeController],
      providers: [
        JokeService,
        {
          provide: getModelToken(Joke.name),
          useValue: JokeSchema,
        },
      ],
      imports: []
    }).compile();

    jokeController = module.get<JokeController>(JokeController);
    jokeService = module.get<JokeService>(JokeService);
    jokeModel = module.get<Model<JokeDocument>>(getModelToken('Joke'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('findAll', () => {
    it('should return an array of jokes', async () => {
      const result: JokeDocument[] = [{ id: '1', content: 'Why did the chicken cross the road?' }] as JokeDocument[];
      jest.spyOn(jokeService, 'findAll').mockResolvedValue(result);

      expect(await jokeController.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single joke', async () => {
      const id = '1';
      const result: JokeDocument = { id, content: 'Why did the chicken cross the road?' } as JokeDocument;
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(result);

      expect(await jokeController.findOne(id)).toBe(result);
    });

    it('should throw a NotFoundException if the joke is not found', async () => {
      const id = '1';
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(undefined);

      await expect(jokeController.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a joke and return it', async () => {
      const createJokeDto: CreateJokeDto = {
        content: 'This is a joke',
      };
      const createdJoke: JokeDocument = { ...createJokeDto, id: '1' } as JokeDocument;
      jest.spyOn(jokeService, 'create').mockResolvedValue(createdJoke);

      const result = await jokeController.create(createJokeDto);

      expect(result).toEqual(createdJoke);
      expect(jokeService.create).toHaveBeenCalledWith(createJokeDto);
    });
  });

  describe('update', () => {
    it('should update a joke and return true', async () => {
      const jokeId = '1';
      const updateJokeDto: UpdateJokeDto = {
        content: 'This is an updated joke',
      };
      const joke: JokeDocument = { id: jokeId } as JokeDocument;
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(joke);
      jest.spyOn(jokeService, 'update').mockResolvedValue(true);

      const result = await jokeController.update(jokeId, updateJokeDto);

      expect(result).toBe(true);
      expect(jokeService.findOne).toHaveBeenCalledWith(jokeId);
      expect(jokeService.update).toHaveBeenCalledWith(jokeId, updateJokeDto);
    });

    it('should throw a NotFoundException if the joke is not found', async () => {
      const jokeId = '1';
      const updateJokeDto: UpdateJokeDto = {
        content: 'This is an updated joke',
      };
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(jokeService, 'update').mockResolvedValue(undefined);


      await expect(jokeController.update(jokeId, updateJokeDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(jokeService.findOne).toHaveBeenCalledWith(jokeId);
      expect(jokeService.update).not.toHaveBeenCalled();
    });
  });

  describe('randomJoke', () => {
    it('should return a random joke', async () => {
      const cookie = { jokes: [] };
      const joke: JokeDocument = { id: '1', content: 'Why did the chicken cross the road?' } as JokeDocument;
      jest.spyOn(jokeService, 'randomJoke').mockResolvedValue(joke);

      const response = {
        cookie: jest.fn(),
        send: jest.fn(),
      };
      await jokeController.randomJoke({ cookies: { jokes: JSON.stringify(cookie) } } as any, response as any);
      expect(response.cookie).toHaveBeenCalledWith('jokes', JSON.stringify({ jokes: [joke.id] }));
      expect(response.send).toHaveBeenCalledWith(joke);
    });

    it('should throw NotFoundException if no joke found', async () => {
      jest.spyOn(jokeService, 'randomJoke').mockResolvedValue(undefined);

      const response = {
        cookie: jest.fn(),
        send: jest.fn(),
      };
      await expect(jokeController.randomJoke({ cookies: { jokes: JSON.stringify({ jokes: [] }) } } as any, response as any)).rejects.toThrowError('Not found joke');
      expect(response.cookie).not.toHaveBeenCalled();
      expect(response.send).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const jokeId = '6400b742e957b148824e243f';
    it('should remove joke successfully', async () => {
      const joke: JokeDocument = { id: jokeId } as JokeDocument;
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(joke);
      jest.spyOn(jokeService, 'remove').mockResolvedValue(true);

      const result = await jokeController.remove(jokeId);

      expect(result).toBe(true);

      expect(jokeService.findOne).toHaveBeenCalledWith(jokeId);
      expect(jokeService.remove).toHaveBeenCalledWith(jokeId);
    });

    it('should throw NotFoundException when joke is not found', async () => {
      const joke: JokeDocument = { id: jokeId } as JokeDocument;
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(jokeService, 'remove').mockResolvedValue(undefined);


      await expect(jokeController.remove(jokeId)).rejects.toThrowError(NotFoundException);

      expect(jokeService.findOne).toHaveBeenCalledWith(jokeId);
      expect(jokeService.remove).not.toHaveBeenCalled();
    });
  });

  describe('vote', () => {
    it('should throw NotFoundException when joke is not found', async () => {
      const id = 'invalid-id';
      const type = 'like';
      jest.spyOn(jokeService, 'findOne').mockResolvedValue(null);

      await expect(
        jokeController.vote({ id, type }, {} as any, {} as any),
      ).rejects.toThrowError(NotFoundException);

      expect(jokeService.findOne).toHaveBeenCalledWith(id);
    });

    it('should add joke to likes and remove from dislikes', async () => {
      const id = 'valid-id';
      const type = 'like';

      const req = { cookies: { jokes: JSON.stringify({ dislike: [id], like: [], jokes: [id] }) } };
      const res = { cookie: jest.fn(), send: jest.fn() };

      jest.spyOn(jokeService, 'findOne').mockResolvedValue({ id } as JokeDocument);

      await jokeController.vote({ id, type }, req as any, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'jokes',
        JSON.stringify({ dislike: [], like: [id], jokes: [id] }),
      );
      expect(res.send).toHaveBeenCalledWith(true);
    });

    it('should add joke to dislike and remove from like', async () => {
      const id = 'valid-id';
      const type = 'dislike';

      const req = { cookies: { jokes: JSON.stringify({ dislike: [], like: [id], jokes: [id] }) } };
      const res = { cookie: jest.fn(), send: jest.fn() };

      jest.spyOn(jokeService, 'findOne').mockResolvedValue({ id } as JokeDocument);

      await jokeController.vote({ id, type }, req as any, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'jokes',
        JSON.stringify({ dislike: [id], like: [], jokes: [id] }),
      );
      expect(res.send).toHaveBeenCalledWith(true);
    });
  })
});
