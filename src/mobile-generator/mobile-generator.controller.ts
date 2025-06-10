import { Controller, Post, Body, Res, HttpStatus, UseGuards, Get, Param, Delete, Patch } from '@nestjs/common';
import { MobileGeneratorService } from './mobile-generator.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateMobileAppDto } from './dto/create-mobile-app.dto';
import { UpdateMobileAppDto } from './dto/update-mobile-app.dto';

@ApiTags('Mobile Generator')
@Controller('mobile-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MobileGeneratorController {
  constructor(private readonly mobileGeneratorService: MobileGeneratorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear y almacenar una nueva aplicación móvil' })
  @ApiResponse({ status: 201, description: 'Aplicación móvil creada correctamente' })
  create(@Body() createMobileAppDto: CreateMobileAppDto, @GetUser() usuario: Usuario) {
    // Asegurar que el usuario actual sea el propietario
    createMobileAppDto.user_id = usuario.id;
    return this.mobileGeneratorService.create(createMobileAppDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las aplicaciones móviles del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de aplicaciones móviles' })
  findAll(@GetUser() usuario: Usuario) {
    return this.mobileGeneratorService.findAllByUserId(usuario.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una aplicación móvil por ID' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil encontrada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  findOne(@Param('id') id: string) {
    return this.mobileGeneratorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una aplicación móvil' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil actualizada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  update(@Param('id') id: string, @Body() updateMobileAppDto: UpdateMobileAppDto) {
    return this.mobileGeneratorService.update(id, updateMobileAppDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una aplicación móvil' })
  @ApiResponse({ status: 200, description: 'Aplicación móvil eliminada' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  remove(@Param('id') id: string) {
    return this.mobileGeneratorService.remove(id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generar proyecto Flutter desde una aplicación móvil guardada' })
  @ApiResponse({ status: 200, description: 'Proyecto Flutter generado como ZIP' })
  @ApiResponse({ status: 404, description: 'Aplicación móvil no encontrada' })
  async generateFlutterProject(
    @Param('id') id: string,
    @GetUser() usuario: Usuario,
    @Res() res: Response,
  ) {
    try {
      const zipBuffer = await this.mobileGeneratorService.generateFlutterProject(id, usuario);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=flutter-project.zip',
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      console.error('Error generando proyecto Flutter:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error generando proyecto Flutter',
        error: error.message,
      });
    }
  }
} 