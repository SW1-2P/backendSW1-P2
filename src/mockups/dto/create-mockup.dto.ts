import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMockupDto {
  @ApiProperty({ example: 'Mockup de inicio', description: 'Nombre del mockup' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ 
    example: '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Button" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="340" y="180" width="100" height="40" as="geometry"/></mxCell></root></mxGraphModel>', 
    description: 'Contenido XML del mockup' 
  })
  @IsNotEmpty()
  @IsString()
  xml: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000', 
    description: 'ID del usuario propietario' 
  })
  @IsUUID()
  user_id: string;
} 