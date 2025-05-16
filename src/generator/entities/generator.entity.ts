import { IsString, IsUUID } from "class-validator";

export class Generator {
    @IsUUID()
    id:Number;

    @IsString()
    xml: string;
}
