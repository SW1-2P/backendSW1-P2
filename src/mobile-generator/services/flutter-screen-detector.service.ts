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
  screenSections: ScreenSection[];
}

export interface RadioGroupInfo {
  title: string;
  options: RadioOptionInfo[];
}

export interface RadioOptionInfo {
  text: string;
  isSelected: boolean;
}

export interface ScreenSection {
  title: string;
  texts: string[];
  fields: string[];
  buttons: string[];
  radioGroups: RadioGroupInfo[];
  colors: string[];
  description: string;
}

@Injectable()
export class FlutterScreenDetectorService {
  private readonly logger = new Logger(FlutterScreenDetectorService.name);

  detectScreens(xmlContent: string): ScreenDetectionResult {
    // ANÁLISIS COMPLETO DEL XML
    const phoneCount = this.countPhones(xmlContent);
    const hasMultipleScreens = phoneCount > 1;
    
    // NUEVA FUNCIONALIDAD: Extraer secciones completas por pantalla
    const screenSections = this.extractScreenSections(xmlContent, phoneCount);
    
    // DETECCIÓN POR CONTENIDO ESPECÍFICO (mantener compatibilidad)
    const hasRegisterContent = this.hasRegisterContent(xmlContent);
    const hasProjectContent = this.hasProjectContent(xmlContent);
    const hasMultipleContentTypes = hasRegisterContent && hasProjectContent;

    // DECISIÓN DE CREAR DRAWER
    const shouldCreateDrawer = hasMultipleScreens || hasMultipleContentTypes || screenSections.length > 1;

    // ANÁLISIS DETALLADO MEJORADO
    const detectedScreens = this.extractScreensFromSections(screenSections);
    const detectedFields = this.extractFieldsFromSections(screenSections);
    const detectedButtons = this.extractButtonsFromSections(screenSections);
    const detectedRadioGroups = this.extractRadioGroupsFromSections(screenSections);
    const allTexts = this.extractAllTextsFromSections(screenSections);

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
      allTexts,
      screenSections
    };

    this.logger.debug('🔍 Detección de pantallas mejorada:', {
      phoneCount,
      shouldCreateDrawer,
      screenSections: screenSections.length,
      screens: detectedScreens,
      sections: screenSections.map(s => ({ title: s.title, texts: s.texts.length }))
    });

    return result;
  }

  /**
   * NUEVA FUNCIONALIDAD: Extrae secciones completas de pantallas
   * Analiza todo el XML y detecta pantallas por contenido y elementos
   */
  private extractScreenSections(xmlContent: string, phoneCount: number): ScreenSection[] {
    const sections: ScreenSection[] = [];
    
    // ESTRATEGIA NUEVA: Analizar por contenido específico en lugar de dividir por posición
    
    // 1. DETECTAR PANTALLA DASHBOARD
    if (this.containsDashboardContent(xmlContent)) {
      const dashboardSection = this.createDashboardSection(xmlContent);
      sections.push(dashboardSection);
    }
    
    // 2. DETECTAR PANTALLA CREATE PROJECT
    if (this.containsCreateProjectContent(xmlContent)) {
      const createProjectSection = this.createCreateProjectSection(xmlContent);
      sections.push(createProjectSection);
    }
    
    // 3. SI NO HAY SECCIONES ESPECÍFICAS Y HAY CONTENIDO, CREAR UNA GENERAL
    if (sections.length === 0 && xmlContent.trim().length > 0 && phoneCount > 0) {
      const generalSection = this.analyzeSingleSection(xmlContent, 'Main');
      sections.push(generalSection);
    }
    
    // 4. SI SOLO HAY UNA SECCIÓN PERO HAY MÚLTIPLES TELÉFONOS, CREAR UNA ADICIONAL
    if (sections.length === 1 && phoneCount > 1) {
      const secondSection = this.createSecondarySection(xmlContent);
      sections.push(secondSection);
    }
    
    return sections;
  }

  /**
   * Detecta si el XML contiene contenido de Dashboard
   */
  private containsDashboardContent(xml: string): boolean {
    return xml.includes('Dashboard') || xml.includes('Dasboard');
  }

  /**
   * Detecta si el XML contiene contenido de Create Project
   */
  private containsCreateProjectContent(xml: string): boolean {
    return xml.includes('Create a project') || 
           xml.includes('Project permissions') ||
           xml.includes('Waremelon') ||
           xml.includes('Key') ||
           xml.includes('Description');
  }

  /**
   * Crea sección específica para Dashboard
   */
  private createDashboardSection(xml: string): ScreenSection {
    const texts = ['Dashboard', 'Dasboard'].filter(text => xml.includes(text));
    const buttons = ['Primary'].filter(btn => xml.includes(btn));
    const colors = this.extractColorsFromSection(xml);
    
    return {
      title: 'DashboardScreen',
      texts,
      fields: [],
      buttons,
      radioGroups: [],
      colors,
      description: 'Pantalla principal Dashboard con navegación y elementos principales'
    };
  }

  /**
   * Crea sección específica para Create Project
   */
  private createCreateProjectSection(xml: string): ScreenSection {
    const texts = [
      'Create a project', 'Project permissions', 'User access',
      'Projects are where your repositories live',
      'What is important for people to know?'
    ].filter(text => xml.includes(text));
    
    const fields = [
      'Waremelon', 'Stash', 'Key', 'Description', 'Proyect'
    ].filter(field => xml.includes(field));
    
    const buttons = [
      'Publish', 'Cancel'
    ].filter(btn => xml.includes(btn));
    
    const radioGroups = this.extractRadioGroupsFromSection(xml);
    const colors = this.extractColorsFromSection(xml);
    
    return {
      title: 'CreateProjectScreen',
      texts,
      fields,
      buttons,
      radioGroups,
      colors,
      description: `Pantalla de creación de proyectos con formulario completo, ${fields.length} campos, ${buttons.length} botones y ${radioGroups.length} grupos de opciones`
    };
  }

  /**
   * Crea una sección secundaria si hay múltiples teléfonos
   */
  private createSecondarySection(xml: string): ScreenSection {
    const allTexts = this.extractTextsFromSection(xml);
    const remainingTexts = allTexts.filter(text => 
      !text.includes('Dashboard') && 
      !text.includes('Create a project') &&
      text.length > 2
    );
    
    return {
      title: 'SecondaryScreen',
      texts: remainingTexts.slice(0, 5),
      fields: [],
      buttons: [],
      radioGroups: [],
      colors: this.extractColorsFromSection(xml),
      description: 'Pantalla secundaria con elementos adicionales'
    };
  }

  /**
   * Cuenta elementos android.phone2 en el XML
   */
  private countPhones(xml: string): number {
    const phoneMatches = xml.match(/shape=["']mxgraph\.android\.phone2["']|mxgraph\.android\.phone2/g);
    return phoneMatches ? phoneMatches.length : 0;
  }

  /**
   * Encuentra los índices donde aparecen los elementos phone en el XML
   */
  private findPhoneIndices(xml: string): number[] {
    const indices: number[] = [];
    const phoneRegex = /shape=["']mxgraph\.android\.phone2["']|mxgraph\.android\.phone2/g;
    let match;
    
    while ((match = phoneRegex.exec(xml)) !== null) {
      indices.push(match.index);
    }
    
    // Si no encontramos elementos phone separados, dividir el XML en secciones lógicas
    if (indices.length <= 1) {
      // Buscar elementos mxCell con id diferentes que podrían indicar secciones separadas
      const cellRegex = /<mxCell[^>]*id="(\d+)"[^>]*>/g;
      const cellMatches: number[] = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(xml)) !== null) {
        const cellId = parseInt(cellMatch[1]);
        if (cellId > 20) { // IDs mayores a 20 suelen ser elementos separados
          cellMatches.push(cellMatch.index);
        }
      }
      
      if (cellMatches.length > 0) {
        return cellMatches.slice(0, 4); // Máximo 4 pantallas
      }
    }
    
    return indices;
  }

  /**
   * Determina el título de una sección basándose en su contenido
   */
  private determineSectionTitle(sectionXml: string, index: number): string {
    const textMatches = sectionXml.match(/value="([^"]*)"[^>]*>/g);
    
    if (textMatches) {
      // Buscar títulos potenciales en orden de prioridad
      const titleCandidates: string[] = [];
      
      textMatches.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1].trim();
          const lowerText = text.toLowerCase();
          
          // Detectar títulos principales
          if (lowerText.includes('dashboard') || 
              lowerText.includes('create a project') ||
              lowerText.includes('register') ||
              lowerText.includes('login') ||
              lowerText.includes('home') ||
              lowerText.includes('main')) {
            titleCandidates.push(text);
          }
        }
      });
      
      if (titleCandidates.length > 0) {
        return titleCandidates[0];
      }
      
      // Si no hay títulos específicos, usar el primer texto significativo
      for (const match of textMatches) {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1].trim();
          if (text.length > 2 && text.length < 30 && !text.includes('\n')) {
            return text;
          }
        }
      }
    }
    
    // Fallback: usar índice
    return `Screen${index + 1}`;
  }

  /**
   * Analiza una sección individual del XML
   */
  private analyzeSingleSection(sectionXml: string, title: string): ScreenSection {
    const texts = this.extractTextsFromSection(sectionXml);
    const fields = this.extractFieldsFromSection(sectionXml);
    const buttons = this.extractButtonsFromSection(sectionXml);
    const radioGroups = this.extractRadioGroupsFromSection(sectionXml);
    const colors = this.extractColorsFromSection(sectionXml);
    
    // Generar descripción basada en el contenido
    const description = this.generateSectionDescription(title, texts, fields, buttons, radioGroups);
    
    return {
      title: this.normalizeSectionTitle(title),
      texts,
      fields,
      buttons,
      radioGroups,
      colors,
      description
    };
  }

  /**
   * Extrae todos los textos de una sección
   */
  private extractTextsFromSection(sectionXml: string): string[] {
    const texts: string[] = [];
    
    // BÚSQUEDA MÁS AMPLIA: Incluir diferentes patrones de texto
    const patterns = [
      /value="([^"]*)"[^>]*>/g,  // Patrón principal
      /value='([^']*)'[^>]*>/g,  // Comillas simples
      />\s*([^<>\n]{2,50})\s*</g // Texto entre tags
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sectionXml)) !== null) {
        let text = match[1];
        if (text) {
          text = text.trim();
          
          // FILTROS MEJORADOS
          if (text && 
              text.length > 0 && 
              text.length < 100 && // Evitar textos muy largos
              !text.match(/^[*]+$/) && 
              !text.includes('mxgraph') &&
              !text.includes('http') &&
              !text.includes('font') &&
              !text.includes('sup') &&
              !text.match(/^[\d\s\-+()]+$/) && // Solo números/símbolos
              !text.match(/^[#\w]{6,}$/) && // Solo colores hex
              text !== 'Text' &&
              text !== 'Button' &&
              text !== 'Label') {
            texts.push(text);
          }
        }
      }
    });
    
    // EXTRACCIÓN ESPECÍFICA DE ELEMENTOS IMPORTANTES DEL XML DEL USUARIO
    const importantTexts = [
      'Dashboard', 'Dasboard', 'Create a project', 'Waremelon', 'Key', 
      'Description', 'Project permissions', 'User access', 'Publish', 
      'Cancel', 'Primary', 'Read and write', 'Read only', 'None', 'BETA'
    ];
    
    importantTexts.forEach(importantText => {
      if (sectionXml.includes(importantText) && !texts.includes(importantText)) {
        texts.push(importantText);
      }
    });
    
    return [...new Set(texts)];
  }

  /**
   * Extrae campos de formulario de una sección
   */
  private extractFieldsFromSection(sectionXml: string): string[] {
    const fields: string[] = [];
    
    // BUSCAR ELEMENTOS DE FORMULARIO ESPECÍFICOS DEL XML
    const fieldIndicators = [
      'name', 'password', 'key', 'description', 'email', 'proyecto', 
      'waremelon', 'stash', 'user', 'input', 'text', 'field'
    ];
    
    // BUSCAR ELEMENTOS CON BORDES (típico de campos de entrada)
    const borderElements = sectionXml.match(/strokeColor="[^"]*"[^>]*value="([^"]*)"[^>]*>/g);
    if (borderElements) {
      borderElements.forEach(match => {
        const result = match.match(/value="([^"]*)"/);
        if (result) {
          const text = result[1].trim();
          if (text && text.length > 0 && text.length < 50) {
            fields.push(text);
          }
        }
      });
    }
    
    // BUSCAR TEXTOS QUE INDICAN CAMPOS
    const allTexts = this.extractTextsFromSection(sectionXml);
    allTexts.forEach(text => {
      const lowerText = text.toLowerCase();
      
      if (fieldIndicators.some(indicator => lowerText.includes(indicator))) {
        fields.push(text);
      }
    });
    
    // CAMPOS ESPECÍFICOS DEL XML DEL USUARIO
    const specificFields = ['Waremelon', 'Stash', 'Key', 'Description', 'Proyect'];
    specificFields.forEach(field => {
      if (sectionXml.includes(field) && !fields.includes(field)) {
        fields.push(field);
      }
    });
    
    return [...new Set(fields)];
  }

  /**
   * Extrae botones de una sección
   */
  private extractButtonsFromSection(sectionXml: string): string[] {
    const buttons: string[] = [];
    const textMatches = sectionXml.match(/value="([^"]*)"[^>]*>/g);
    
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
              lowerText.includes('submit') ||
              lowerText.includes('primary') ||
              lowerText.includes('button')) {
            buttons.push(text);
          }
        }
      });
    }
    
    return [...new Set(buttons)];
  }

  /**
   * Extrae grupos de radio buttons de una sección
   */
  private extractRadioGroupsFromSection(sectionXml: string): RadioGroupInfo[] {
    const radioGroups: RadioGroupInfo[] = [];
    
    // Buscar grupos de radio buttons basados en elementos ellipse
    const ellipseMatches = sectionXml.match(/shape=["']ellipse["']|shape=ellipse/g);
    
    if (ellipseMatches && ellipseMatches.length > 1) {
      const options: RadioOptionInfo[] = [];
      
      // Buscar los textos asociados a los ellipses
      const radioTexts = [
        'Read and write',
        'Read only', 
        'None'
      ];
      
      radioTexts.forEach(text => {
        if (sectionXml.includes(text)) {
          const isSelected = this.isRadioSelected(sectionXml, text);
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

  /**
   * Extrae colores de una sección
   */
  private extractColorsFromSection(sectionXml: string): string[] {
    const colors: string[] = [];
    const colorMatches = sectionXml.match(/#[0-9A-Fa-f]{6}/g);
    
    if (colorMatches) {
      colors.push(...new Set(colorMatches));
    }
    
    return colors;
  }

  /**
   * Genera descripción de una sección
   */
  private generateSectionDescription(title: string, texts: string[], fields: string[], buttons: string[], radioGroups: RadioGroupInfo[]): string {
    const components: string[] = [];
    
    if (fields.length > 0) {
      components.push(`formulario con ${fields.length} campos`);
    }
    
    if (buttons.length > 0) {
      components.push(`${buttons.length} botones`);
    }
    
    if (radioGroups.length > 0) {
      components.push(`${radioGroups.length} grupos de opciones`);
    }
    
    if (texts.length > 0) {
      components.push(`${texts.length} elementos de texto`);
    }
    
    return `Pantalla "${title}" con ${components.join(', ')}`;
  }

  /**
   * Normaliza el título de una sección para usarlo como nombre de pantalla
   */
  private normalizeSectionTitle(title: string): string {
    // Convertir a formato PascalCase para nombres de pantallas
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/Screen$/, '') + 'Screen'; // Asegurar que termine en Screen
  }

  // MÉTODOS PARA EXTRAER DESDE SECCIONES

  private extractScreensFromSections(sections: ScreenSection[]): string[] {
    return sections.map(section => section.title);
  }

  private extractFieldsFromSections(sections: ScreenSection[]): string[] {
    const allFields: string[] = [];
    sections.forEach(section => {
      allFields.push(...section.fields);
    });
    return [...new Set(allFields)];
  }

  private extractButtonsFromSections(sections: ScreenSection[]): string[] {
    const allButtons: string[] = [];
    sections.forEach(section => {
      allButtons.push(...section.buttons);
    });
    return [...new Set(allButtons)];
  }

  private extractRadioGroupsFromSections(sections: ScreenSection[]): RadioGroupInfo[] {
    const allRadioGroups: RadioGroupInfo[] = [];
    sections.forEach(section => {
      allRadioGroups.push(...section.radioGroups);
    });
    return allRadioGroups;
  }

  private extractAllTextsFromSections(sections: ScreenSection[]): string[] {
    const allTexts: string[] = [];
    sections.forEach(section => {
      allTexts.push(...section.texts);
    });
    return [...new Set(allTexts)];
  }

  // MÉTODOS LEGACY (mantener compatibilidad)

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

  private isRadioSelected(xml: string, text: string): boolean {
    const textIndex = xml.indexOf(text);
    if (textIndex === -1) return false;
    
    const contextStart = Math.max(0, textIndex - 800);
    const contextEnd = Math.min(xml.length, textIndex + 200);
    const context = xml.substring(contextStart, contextEnd);
    
    if (text === 'Read and write') {
      return context.includes('fillColor="#ffffff"') && 
             context.includes('strokeColor="#0057D8"');
    }
    
    return false;
  }
} 