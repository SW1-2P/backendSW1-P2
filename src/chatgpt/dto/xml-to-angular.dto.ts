import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class XmlToAngularDto {
  @IsString()
  @IsNotEmpty()
  xml: string;
  
  @IsOptional()
  @IsString()
  model?: string;
  
  @IsOptional()
  specificInstructions?: string;
}
