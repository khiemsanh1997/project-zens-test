import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateJokeDto } from './dto/create-joke.dto';
import { UpdateJokeDto } from './dto/update-joke.dto';
import { Joke, JokeDocument } from './schemas/joke.schema';

@Injectable()
export class JokeService {
  constructor(@InjectModel(Joke.name) private jokeModel: Model<JokeDocument>) { }
  async create(createJokeDto: CreateJokeDto): Promise<JokeDocument> {
    const data = await this.jokeModel.create(createJokeDto);
    return data;
  }

  async findAll(): Promise<JokeDocument[]> {
    return this.jokeModel.find();
  }

  async findOne(id: string): Promise<JokeDocument> {
    return this.jokeModel.findOne({
      _id: new Types.ObjectId(id),
    });
  }

  async randomJoke(ids: string[]): Promise<JokeDocument> {
    return this.jokeModel.findOne({
      _id: {
        $nin: ids.map(e => { return new Types.ObjectId(e) })
      },
    });
  }

  async update(id: string, updateJokeDto: UpdateJokeDto): Promise<boolean> {
    const update = await this.jokeModel.updateOne(
      { _id: new Types.ObjectId(id) },
      updateJokeDto,
    );
    return update.modifiedCount > 0 ? true : false;
  }

  async remove(id: string): Promise<boolean> {
    const remove = await this.jokeModel.updateOne({ _id: new Types.ObjectId(id), }, { deletedAt: new Date() });
    return remove.modifiedCount > 0 ? true : false;
  }
}
