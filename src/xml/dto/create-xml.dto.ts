import { IsString } from "class-validator";

export class CreateXmlDto {
    @IsString()
    xml: string;
}
