import { Controller, Get, Post, Body,Res,HttpStatus } from '@nestjs/common';
import { XmlService } from './xml.service';
import { Response } from 'express';

import { CreateXmlDto } from './dto/create-xml.dto';
import { UpdateXmlDto } from './dto/update-xml.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody} from '@nestjs/swagger';
@ApiTags('XML')
@Controller('xml')
export class XmlController {
  constructor(private readonly xmlService: XmlService) {}

  @Post()
@ApiOperation({ summary: 'Recibe un XML como string' })
@ApiConsumes('application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        xml: {
          type: 'string',
          example: '<root><component name="TestComponent" /></root>',
        },
      },
    },
  })
  async uploadXmlString(@Body() body: { xml: string }, @Res() res: Response) {
    try {
      const zipBuffer = await this.xmlService.processXml(body.xml);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=generated-project.zip',
      });

      res.status(HttpStatus.OK).send(zipBuffer);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error processing XML',
        error: error.message,
      });
    }
  }

}