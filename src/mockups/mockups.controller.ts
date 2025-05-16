import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MockupsService } from './mockups.service';
import { CreateMockupDto } from './dto/create-mockup.dto';
import { UpdateMockupDto } from './dto/update-mockup.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';

@ApiTags('Mockups')
@Controller('mockups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockupsController {
  constructor(private readonly mockupsService: MockupsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo mockup' })
  @ApiResponse({ status: 201, description: 'Mockup creado correctamente' })
  create(@Body() createMockupDto: CreateMockupDto, @GetUser() usuario: Usuario) {
    // Aseguramos que el usuario actual sea el propietario
    createMockupDto.user_id = usuario.id;
    return this.mockupsService.create(createMockupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los mockups del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de mockups' })
  findAll(@GetUser() usuario: Usuario) {
    return this.mockupsService.findAllByUserId(usuario.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un mockup por ID' })
  @ApiResponse({ status: 200, description: 'Mockup encontrado' })
  @ApiResponse({ status: 404, description: 'Mockup no encontrado' })
  findOne(@Param('id') id: string) {
    return this.mockupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un mockup' })
  @ApiResponse({ status: 200, description: 'Mockup actualizado' })
  @ApiResponse({ status: 404, description: 'Mockup no encontrado' })
  update(@Param('id') id: string, @Body() updateMockupDto: UpdateMockupDto) {
    return this.mockupsService.update(id, updateMockupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un mockup' })
  @ApiResponse({ status: 200, description: 'Mockup eliminado' })
  @ApiResponse({ status: 404, description: 'Mockup no encontrado' })
  remove(@Param('id') id: string) {
    return this.mockupsService.remove(id);
  }
} 