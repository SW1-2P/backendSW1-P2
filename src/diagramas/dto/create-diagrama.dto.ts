import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDiagramaDto {
  @ApiProperty({ example: 'Diagrama de clases', description: 'Nombre del diagrama' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ 
    example: '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Clase" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="340" y="180" width="120" height="60" as="geometry"/></mxCell></root></mxGraphModel>', 
    description: 'Contenido XML del diagrama' 
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
