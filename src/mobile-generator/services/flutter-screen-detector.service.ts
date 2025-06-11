import { Injectable, Logger } from '@nestjs/common';

export interface ScreenDetectionResult {
  hasMultipleScreens: boolean;
  shouldCreateDrawer: boolean;
  phoneCount: number;
  hasRegisterContent: boolean;
  hasProjectContent: boolean;
  detectedScreens: string[];
  detectedFields: string[];
  detectedButtons: string[];
  detectedRadioGroups: RadioGroupInfo[];
  allTexts: string[];
}

export interface RadioGroupInfo {
  title: string;
  options: RadioOptionInfo[];
}

export interface RadioOptionInfo {
  text: string;
  isSelected: boolean;
}

@Injectable()
export class FlutterScreenDetectorService {
  private readonly logger = new Logger(FlutterScreenDetectorService.name);

  detectScreens(xmlContent: string): ScreenDetectionResult {
    // DETECCIÓN POR ELEMENTOS PHONE (considerar entidades HTML)
    const phoneMatches = xmlContent.match(/shape=["']mxgraph\.android\.phone2["']|mxgraph\.android\.phone2/g);
    const phoneCount = phoneMatches ? phoneMatches.length : 0;
    const hasMultipleScreens = phoneCount > 1;

    // DETECCIÓN POR CONTENIDO ESPECÍFICO
    const hasRegisterContent = this.hasRegisterContent(xmlContent);
    const hasProjectContent = this.hasProjectContent(xmlContent);
    const hasMultipleContentTypes = hasRegisterContent && hasProjectContent;

    // DECISIÓN DE CREAR DRAWER
    const shouldCreateDrawer = hasMultipleScreens || hasMultipleContentTypes;

    // ANÁLISIS DETALLADO
    const detectedScreens = this.extractScreens(xmlContent);
    const detectedFields = this.extractFields(xmlContent);
    const detectedButtons = this.extractButtons(xmlContent);
    const detectedRadioGroups = this.extractRadioGroups(xmlContent);
    const allTexts = this.extractAllTexts(xmlContent);

    const result: ScreenDetectionResult = {
      hasMultipleScreens,
      shouldCreateDrawer,
      phoneCount,
      hasRegisterContent,
      hasProjectContent,
      detectedScreens,
      detectedFields,
      detectedButtons,
      detectedRadioGroups,
      allTexts
    };

    this.logger.debug('🔍 Detección de pantallas:', {
      phoneCount,
      shouldCreateDrawer,
      screens: detectedScreens,
      fields: detectedFields.length,
      buttons: detectedButtons.length
    });

    return result;
  }

  private hasRegisterContent(xml: string): boolean {
    const registerIndicators = [
      'Register',
      'Your name',
      'Password',
      'Guardar'
    ];

    return registerIndicators.some(indicator => 
      xml.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private hasProjectContent(xml: string): boolean {
    const projectIndicators = [
      'Create a project',
      'Project permissions',
      'Publish',
      'User access',
      'Key',
      'Description'
    ];

    return projectIndicators.some(indicator => 
      xml.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  private extractScreens(xml: string): string[] {
    const screenTitles: string[] = [];
    const textMatches = xml.match(/value="([^"]*)"[^>]*>/g);
    
    if (textMatches) {
      textMatches.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1];
          const lowerText = text.toLowerCase();
          
          if (lowerText.includes('register') || 
              lowerText.includes('create a project') ||
              lowerText.includes('create project')) {
            screenTitles.push(text);
          }
        }
      });
    }

    return [...new Set(screenTitles)];
  }

  private extractFields(xml: string): string[] {
    const fields: string[] = [];
    const textMatches = xml.match(/value="([^"]*)"[^>]*>/g);
    
    if (textMatches) {
      textMatches.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1];
          const lowerText = text.toLowerCase();
          
          if (lowerText.includes('name') || 
              lowerText.includes('password') ||
              lowerText.includes('key') ||
              lowerText.includes('description') ||
              lowerText.includes('email')) {
            fields.push(text);
          }
        }
      });
    }

    return [...new Set(fields)];
  }

  private extractButtons(xml: string): string[] {
    const buttons: string[] = [];
    const textMatches = xml.match(/value="([^"]*)"[^>]*>/g);
    
    if (textMatches) {
      textMatches.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1];
          const lowerText = text.toLowerCase();
          
          if (lowerText.includes('guardar') || 
              lowerText.includes('publish') ||
              lowerText.includes('cancel') ||
              lowerText.includes('save') ||
              lowerText.includes('submit')) {
            buttons.push(text);
          }
        }
      });
    }

    return [...new Set(buttons)];
  }

  extractColors(xml: string): { primary: string; secondary: string; accent: string } {
    const defaultColors = {
      primary: '0xFF0057D8',
      secondary: '0xFF4C9AFF', 
      accent: '0xFF2196F3'
    };

    if (!xml) return defaultColors;

    try {
      const colorMatches = xml.match(/#[0-9A-Fa-f]{6}/g);
      if (colorMatches && colorMatches.length > 0) {
        const uniqueColors = [...new Set(colorMatches)];
        
        return {
          primary: uniqueColors[0] ? `0xFF${uniqueColors[0].substring(1)}` : defaultColors.primary,
          secondary: uniqueColors[1] ? `0xFF${uniqueColors[1].substring(1)}` : defaultColors.secondary,
          accent: uniqueColors[2] ? `0xFF${uniqueColors[2].substring(1)}` : defaultColors.accent,
        };
      }
    } catch (error) {
      this.logger.warn('Error extrayendo colores del XML:', error);
    }

    return defaultColors;
  }

  private extractRadioGroups(xml: string): RadioGroupInfo[] {
    const radioGroups: RadioGroupInfo[] = [];
    
    // Buscar grupos de radio buttons basados en elementos ellipse (considerar entidades HTML)
    const ellipseMatches = xml.match(/shape=["']ellipse["']|shape=ellipse/g);
    
    if (ellipseMatches && ellipseMatches.length > 1) {
      // Detectar si hay un grupo de radio buttons
      const options: RadioOptionInfo[] = [];
      
      // Buscar los textos asociados a los ellipses
      const radioTexts = [
        'Read and write',
        'Read only', 
        'None'
      ];
      
      // Extraer opciones del XML
      radioTexts.forEach(text => {
        if (xml.includes(text)) {
          // Determinar si está seleccionado basado en fillColor
          const isSelected = this.isRadioSelected(xml, text);
          options.push({
            text,
            isSelected
          });
        }
      });
      
      if (options.length > 0) {
        radioGroups.push({
          title: 'User access',
          options
        });
      }
    }
    
    return radioGroups;
  }

  private isRadioSelected(xml: string, text: string): boolean {
    // Buscar el patrón que indica selección
    // fillColor="#ffffff" + strokeColor="#0057D8" indica seleccionado
    // fillColor="#F0F2F5" indica no seleccionado
    const textIndex = xml.indexOf(text);
    if (textIndex === -1) return false;
    
    // Buscar hacia atrás el contexto del elemento
    const contextStart = Math.max(0, textIndex - 800);
    const contextEnd = Math.min(xml.length, textIndex + 200);
    const context = xml.substring(contextStart, contextEnd);
    
    // "Read and write" es la opción por defecto según el XML
    if (text === 'Read and write') {
      return context.includes('fillColor="#ffffff"') && 
             context.includes('strokeColor="#0057D8"');
    }
    
    // Otras opciones no están seleccionadas por defecto
    return false;
  }

  private extractAllTexts(xml: string): string[] {
    const texts: string[] = [];
    const textMatches = xml.match(/value="([^"]*)"[^>]*>/g);
    
    if (textMatches) {
      textMatches.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1].trim();
          if (text && text.length > 0 && !text.match(/^[*]+$/)) {
            // Filtrar textos de passwords o vacíos
            texts.push(text);
          }
        }
      });
    }
    
    return [...new Set(texts)];
  }
} 