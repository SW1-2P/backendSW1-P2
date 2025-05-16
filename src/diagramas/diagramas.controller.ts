import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DiagramasService } from './diagramas.service';
import { CreateDiagramaDto } from './dto/create-diagrama.dto';
import { UpdateDiagramaDto } from './dto/update-diagrama.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Diagramas')
@Controller('diagramas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiagramasController {
  constructor(private readonly diagramasService: DiagramasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo diagrama' })
  @ApiResponse({ status: 201, description: 'Diagrama creado correctamente' })
  create(@Body() createDiagramaDto: CreateDiagramaDto, @GetUser() usuario: Usuario) {
    // Aseguramos que el usuario actual sea el propietario
    createDiagramaDto.user_id = usuario.id;
    return this.diagramasService.create(createDiagramaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los diagramas del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de diagramas' })
  findAll(@GetUser() usuario: Usuario) {
    return this.diagramasService.findAllByUserId(usuario.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un diagrama por ID' })
  @ApiResponse({ status: 200, description: 'Diagrama encontrado' })
  @ApiResponse({ status: 404, description: 'Diagrama no encontrado' })
  findOne(@Param('id') id: string) {
    return this.diagramasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un diagrama' })
  @ApiResponse({ status: 200, description: 'Diagrama actualizado' })
  @ApiResponse({ status: 404, description: 'Diagrama no encontrado' })
  update(@Param('id') id: string, @Body() updateDiagramaDto: UpdateDiagramaDto) {
    return this.diagramasService.update(id, updateDiagramaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un diagrama' })
  @ApiResponse({ status: 200, description: 'Diagrama eliminado' })
  @ApiResponse({ status: 404, description: 'Diagrama no encontrado' })
  remove(@Param('id') id: string) {
    return this.diagramasService.remove(id);
  }
} 