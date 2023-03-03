import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { concat, filter, uniq } from 'lodash';
import { ApiBody, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';


import { JokeService } from './joke.service';
import { VoteJokeDto } from './dto/vote-joke.dto';
import { CreateJokeDto } from './dto/create-joke.dto';
import { UpdateJokeDto } from './dto/update-joke.dto';
import { ParseObjectIdPipe } from './dto/validate-objectId';

import { JokeDocument } from './schemas/joke.schema';

type JokeCookie = {
  jokes: string[];
  like: string[];
  dislike: string[]
}
class JokeResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  content: string;

  // Add any other properties you want to include in the response
}

@Controller('joke')
export class JokeController {
  constructor(private readonly jokeService: JokeService) { }

  @Get()
  @ApiOperation({ summary: 'Get all jokes' })
  @ApiResponse({ status: 200, description: 'Return all jokes.', type: [JokeResponse] })
  async findAll(): Promise<JokeDocument[]> {
    return this.jokeService.findAll();
  }

  @Get('/random')
  @ApiOperation({ summary: 'Get a random joke' })
  @ApiResponse({ status: 200, description: 'Return a random joke.', type: JokeResponse })
  @ApiResponse({ status: 404, description: 'Not found joke.' })
  async randomJoke(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const cookie: JokeCookie = JSON.parse(req.cookies['jokes'] || "{}");
    const joke = await this.jokeService.randomJoke(cookie?.jokes || []);
    if (!joke) throw new NotFoundException('Not found joke');
    cookie.jokes = uniq(concat(cookie.jokes || [], joke.id));
    res.cookie('jokes', JSON.stringify(cookie));
    res.send(joke);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a joke by ID' })
  @ApiResponse({ status: 200, description: 'Return a joke by ID.', type: JokeResponse })
  @ApiResponse({ status: 404, description: 'Not found joke.' })
  async findOne(
    @Param('id') id: string,
  ): Promise<JokeDocument> {
    const joke = await this.jokeService.findOne(id);
    if (!joke) throw new NotFoundException('Not found joke');
    return joke;
  }

  @Post()
  @ApiOperation({ summary: 'Create a joke' })
  @ApiBody({ type: CreateJokeDto })
  @ApiResponse({ status: 201, description: 'The joke has been successfully created.', type: JokeResponse })
  async create(@Body() createJokeDto: CreateJokeDto): Promise<JokeDocument> {
    return this.jokeService.create(createJokeDto);
  }

  @Post('/vote/:id/:type')
  @ApiOperation({ summary: 'Vote a joke' })
  @ApiResponse({ status: 200, description: 'The vote has been successfully submitted.', type: Boolean })
  @ApiResponse({ status: 404, description: 'Not found joke.' })
  async vote(@Param(ParseObjectIdPipe) param: VoteJokeDto, @Req() req: Request, @Res() res: Response): Promise<void> {
    const { type, id } = param;
    const joke = await this.jokeService.findOne(id);
    if (!joke) throw new NotFoundException('Not found joke');
    const cookie: JokeCookie = JSON.parse(req.cookies['jokes'] || "{}");
    if (type === "like" && !cookie.like?.includes(joke.id)) {
      cookie.like = uniq(concat(cookie.like || [], joke.id));
      cookie.dislike = filter(cookie.dislike, (id) => joke.id !== id);
    }
    if (type === "dislike" && !cookie.dislike?.includes(joke.id)) {
      cookie.dislike = uniq(concat(cookie.dislike || [], joke.id));
      cookie.like = filter(cookie.like, (id) => joke.id !== id);
    }
    cookie.jokes = uniq(concat(cookie.jokes || [], joke.id));
    res.cookie('jokes', JSON.stringify(cookie));
    res.send(true);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a joke' })
  @ApiBody({ type: UpdateJokeDto })
  @ApiResponse({ status: 200, description: 'The joke has been successfully updated.', type: Boolean })
  @ApiResponse({ status: 404, description: 'Not found joke.' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateJokeDto: UpdateJokeDto,
  ): Promise<boolean> {
    const joke = await this.jokeService.findOne(id);
    if (!joke) throw new NotFoundException('Not found joke');
    return this.jokeService.update(id, updateJokeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a joke' })
  @ApiResponse({ status: 200, description: 'The joke has been successfully deleted.', type: Boolean })
  @ApiResponse({ status: 404, description: 'Not found joke.' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<boolean> {
    const joke = await this.jokeService.findOne(id);
    if (!joke) throw new NotFoundException('Not found joke');
    return this.jokeService.remove(id);
  }
}
