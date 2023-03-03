import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JokeService } from './joke.service';
import { JokeController } from './joke.controller';
import { Joke, JokeSchema } from './schemas/joke.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Joke.name,
        useFactory: () => {
          const schema = JokeSchema;
          schema.pre('find', function () {
            this.where({ deletedAt: { $eq: null } });
          });
          schema.pre('findOne', function () {
            this.where({ deletedAt: { $eq: null } });
          });
          schema.pre('updateOne', function () {
            this.where({ deletedAt: { $eq: null } });
          });
          schema.pre('updateMany', function () {
            this.where({ deletedAt: { $eq: null } });
          });
          return schema;
        },
      },
    ]),
  ],
  controllers: [JokeController],
  providers: [JokeService],
})
export class JokeModule {}
