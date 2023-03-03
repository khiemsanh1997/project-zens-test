import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JokeModule } from './joke/joke.module';

import * as dotenv from "dotenv";
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [()=>({
        port: parseInt(process.env.PORT, 10) || 3000,
        mongo_url: process.env.MONGO_URL
      })]
    }),
    MongooseModule.forRootAsync({
      inject:[ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>{
        return {
          uri: configService.get<string>("mongo_url"),
  
        }
      }
    }),
    JokeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
