import { Injectable } from '@nestjs/common';
import * as xml2js from 'xml2js';
import * as fs from 'fs-extra';
import { Express } from 'express';
import { CreateXmlDto } from './dto/create-xml.dto';
import { UpdateXmlDto } from './dto/update-xml.dto';
import { GeneratorService } from 'src/generator/generator.service';

@Injectable()
export class XmlService {
  constructor(private readonly generatorService: GeneratorService) {}

  async processXml(xmlContent: string): Promise<Buffer> {
    try {
      // Convertir XML a JSON para logging (pero usamos el XML original para el generador)
      const parser = new xml2js.Parser({ 
        explicitArray: false,
        mergeAttrs: false
      });
      
      const result = await parser.parseStringPromise(xmlContent);
      console.log('XML recibido:', result);
      
      // Pasar el XML directamente al generador para que él haga el parsing
      const zipBuffer = await this.generatorService.generateFromXml(xmlContent);
      return zipBuffer;
    } catch (error) {
      console.error('Error procesando XML:', error);
      throw error; // Re-lanzar para que el controlador pueda manejarlo
    }
  }
}
