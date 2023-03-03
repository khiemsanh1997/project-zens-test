import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class CreateJokeDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'content joke', required: true })
  readonly content: string;
}
