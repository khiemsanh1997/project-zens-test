import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type JokeDocument = HydratedDocument<Joke>;

@Schema()
export class Joke {
  @Prop({ required: true, trim: true })
  content: string;

  // @Prop({ default: 0 })
  // like: number;

  // @Prop({ default: 0 })
  // dislike: number;

  @Prop({ default: null })
  deletedAt: Date;
}


export const JokeSchema = SchemaFactory.createForClass(Joke);
