import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsIn, IsString } from "class-validator";
import { ParseObjectIdPipe } from "./validate-objectId";

export class VoteJokeDto {
  @IsDefined()
  @IsString()
  @IsIn(["like", "dislike"])
  @ApiProperty({ description: 'like or dislike', enum: ['like', 'dislike'] })
  readonly type: "like" | "dislike";

  @IsDefined()
  @IsString()
  @ApiProperty({ description: 'id of the joke', example: '603fb2c9f7416d7890886f1d' })
  readonly id: string;
}
