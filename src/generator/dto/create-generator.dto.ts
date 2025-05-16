import { IsString } from "class-validator";

export class CreateGeneratorDto {
    @IsString()
    xml: string;
}
