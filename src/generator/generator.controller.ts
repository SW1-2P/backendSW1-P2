import { Controller, Get, Post, Body, Res, HttpStatus, Param, Delete } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { Response } from 'express';

import { CreateGeneratorDto } from './dto/create-generator.dto';
import { UpdateGeneratorDto } from './dto/update-generator.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody} from '@nestjs/swagger';

@ApiTags('Generator')
@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @Post()
  @ApiOperation({ summary: 'Genera un proyecto Angular a partir de un XML' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        xml: {
          type: 'string',
          example: '<App><Interface name="Test"></Interface></App>',
        },
      },
    },
  })
  async generateAngularProject(
    @Body() body: CreateGeneratorDto,
    @Res() res: Response,
  ) {
    try {
      const zipBuffer = await this.generatorService.generateFromXml(body.xml);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=angular-project.zip',
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      console.error('Error generando proyecto:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error generando proyecto Angular',
        error: error.message,
      });
    }
  }

  @Post('test-flexible')
  @ApiOperation({ summary: 'Prueba la generación flexible de proyectos Angular con cualquier formato XML' })
  @ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        xml: {
          type: 'string',
          example: '<Form name="Test"><field name="input1" type="input"/></Form>',
        },
      },
    },
  })
  async testFlexibleXml(
    @Body() body: { xml: string },
    @Res() res: Response,
  ) {
    try {
      console.log('Procesando XML flexible:', body.xml.substring(0, 100) + '...');
      const zipBuffer = await this.generatorService.generateFromXml(body.xml);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=flexible-angular-project.zip',
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      console.error('Error en test flexible:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error en test flexible',
        error: error.message,
        stack: error.stack
      });
    }
  }
}
