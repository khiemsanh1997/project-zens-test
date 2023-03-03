import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateJokeDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'content joke', required: true })
    readonly content: string;
  }
  