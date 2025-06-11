import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Asumiendo que existe una entidad Mockup en el módulo de páginas/mockups
// Si no existe, esta interfaz define la estructura esperada
export interface MockupData {
  id: string;
  nombre: string;
  contenido: any; // JSON con la estructura del mockup
  tipo: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MockupIntegrationService {
  private readonly logger = new Logger(MockupIntegrationService.name);

  constructor(
    // Si tienes una entidad Mockup, descomenta la siguiente línea
    // @InjectRepository(Mockup)
    // private mockupRepository: Repository<Mockup>,
  ) {}

  /**
   * Obtiene los datos de un mockup por su ID
   * @param mockupId ID del mockup a obtener
   * @param userId ID del usuario para verificar permisos
   * @returns Datos del mockup
   */
  async getMockupData(mockupId: string, userId?: string): Promise<MockupData> {
    try {
      // TODO: Implementar la obtención real del mockup
      // const mockup = await this.mockupRepository.findOne({
      //   where: { id: mockupId, ...(userId && { user_id: userId }) }
      // });
      
      // if (!mockup) {
      //   throw new NotFoundException(`Mockup con ID ${mockupId} no encontrado`);
      // }
      
      // return mockup;

      // Por ahora, retornamos datos de ejemplo
      this.logger.warn(`Obteniendo mockup ${mockupId} - usando datos de ejemplo`);
      
      return {
        id: mockupId,
        nombre: 'Mockup de ejemplo',
        contenido: {
          type: 'mobile-app',
          screens: [
            {
              name: 'login',
              title: 'Iniciar Sesión',
              components: [
                { type: 'text-input', label: 'Email', required: true },
                { type: 'text-input', label: 'Contraseña', required: true, secure: true },
                { type: 'button', label: 'Iniciar Sesión', action: 'login' },
                { type: 'link', label: '¿Olvidaste tu contraseña?', action: 'forgot-password' }
              ]
            },
            {
              name: 'dashboard',
              title: 'Dashboard',
              components: [
                { type: 'header', text: 'Bienvenido' },
                { type: 'grid', items: [
                  { type: 'card', title: 'Estadísticas', icon: 'chart' },
                  { type: 'card', title: 'Usuarios', icon: 'users' },
                  { type: 'card', title: 'Reportes', icon: 'file' },
                  { type: 'card', title: 'Configuración', icon: 'settings' }
                ]}
              ]
            }
          ]
        },
        tipo: 'mobile',
        user_id: userId || 'user-example',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
    } catch (error) {
      this.logger.error(`Error obteniendo mockup ${mockupId}:`, error);
      throw error;
    }
  }

  /**
   * Convierte datos de mockup a un formato más amigable para la IA
   * @param mockupData Datos originales del mockup
   * @returns Datos procesados para la generación
   */
  async processMockupForGeneration(mockupData: MockupData): Promise<any> {
    try {
      const processed: any = {
        id: mockupData.id,
        name: mockupData.nombre,
        type: mockupData.tipo,
        structure: mockupData.contenido,
        metadata: {
          created: mockupData.createdAt,
          updated: mockupData.updatedAt,
          screens_count: mockupData.contenido?.screens?.length || 0
        }
      };

      // Extraer información adicional para mejorar la generación
      if (mockupData.contenido?.screens) {
        processed.screens_summary = mockupData.contenido.screens.map((screen: any) => ({
          name: screen.name,
          title: screen.title,
          components_count: screen.components?.length || 0,
          has_forms: screen.components?.some((c: any) => c.type === 'text-input') || false,
          has_navigation: screen.components?.some((c: any) => c.action) || false
        }));
      }

      this.logger.debug(`Mockup ${mockupData.id} procesado para generación`);
      return processed;
      
    } catch (error) {
      this.logger.error(`Error procesando mockup ${mockupData.id}:`, error);
      throw error;
    }
  }

  /**
   * Valida si un mockup es compatible para la generación de código
   * @param mockupData Datos del mockup
   * @returns true si es válido, false en caso contrario
   */
  validateMockupForGeneration(mockupData: MockupData): boolean {
    try {
      // Validaciones básicas
      if (!mockupData.contenido) {
        this.logger.warn(`Mockup ${mockupData.id} no tiene contenido`);
        return false;
      }

      if (!mockupData.contenido.screens || !Array.isArray(mockupData.contenido.screens)) {
        this.logger.warn(`Mockup ${mockupData.id} no tiene pantallas definidas`);
        return false;
      }

      if (mockupData.contenido.screens.length === 0) {
        this.logger.warn(`Mockup ${mockupData.id} no tiene pantallas`);
        return false;
      }

      // Validar que las pantallas tengan estructura básica
      for (const screen of mockupData.contenido.screens) {
        if (!screen.name || !screen.components) {
          this.logger.warn(`Pantalla inválida en mockup ${mockupData.id}`);
          return false;
        }
      }

      return true;
      
    } catch (error) {
      this.logger.error(`Error validando mockup ${mockupData.id}:`, error);
      return false;
    }
  }

  /**
   * Genera un XML simplificado a partir de los datos del mockup
   * Útil para la compatibilidad con el generador actual
   * @param mockupData Datos del mockup
   * @returns XML string
   */
  generateXmlFromMockup(mockupData: MockupData): string {
    try {
      let xml = `<App name="${mockupData.nombre}">`;
      
      if (mockupData.contenido?.screens) {
        for (const screen of mockupData.contenido.screens) {
          xml += `<Screen name="${screen.name}" title="${screen.title || screen.name}">`;
          
          if (screen.components) {
            for (const component of screen.components) {
              xml += this.componentToXml(component);
            }
          }
          
          xml += '</Screen>';
        }
      }
      
      xml += '</App>';
      
      this.logger.debug(`XML generado para mockup ${mockupData.id}`);
      return xml;
      
    } catch (error) {
      this.logger.error(`Error generando XML para mockup ${mockupData.id}:`, error);
      return `<App name="${mockupData.nombre}"><Screen name="default"><Text>Error processing mockup</Text></Screen></App>`;
    }
  }

  private componentToXml(component: any): string {
    switch (component.type) {
      case 'text-input':
        return `<Input label="${component.label}" required="${component.required || false}" secure="${component.secure || false}" />`;
      case 'button':
        return `<Button action="${component.action || ''}">${component.label}</Button>`;
      case 'text':
      case 'header':
        return `<Text>${component.text || component.label}</Text>`;
      case 'card':
        return `<Card title="${component.title}" icon="${component.icon || ''}" />`;
      case 'link':
        return `<Link action="${component.action || ''}">${component.label}</Link>`;
      case 'grid':
        let gridXml = '<Grid>';
        if (component.items) {
          for (const item of component.items) {
            gridXml += this.componentToXml(item);
          }
        }
        gridXml += '</Grid>';
        return gridXml;
      default:
        return `<Component type="${component.type}">${component.label || component.text || ''}</Component>`;
    }
  }
} 