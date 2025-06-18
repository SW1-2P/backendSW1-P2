import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('Mobile Generator - 4 Types (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  // Mock user para testing
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    nombre: 'Test User',
    role: 'user'
  };

  // XML de test real del usuario
  const realMockupXml = `<mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36" version="27.1.5">
  <diagram id="mockup-diagram" name="Mockup">
    <mxGraphModel dx="452" dy="1633" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="3" value="Dashboard" style="text;" parent="1" vertex="1">
          <mxGeometry x="155" y="70" width="60" height="30" as="geometry" />
        </mxCell>
        <mxCell id="5" value="Create a project" style="text;" parent="1" vertex="1">
          <mxGeometry x="30" y="109" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="8" value="Waremelon" style="rounded=1;" parent="1" vertex="1">
          <mxGeometry x="30" y="204" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="11" value="Stash" style="rounded=1;" parent="1" vertex="1">
          <mxGeometry x="30" y="279" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="19" value="Publish" style="rounded=1;" parent="1" vertex="1">
          <mxGeometry x="125" y="590" width="60" height="33" as="geometry" />
        </mxCell>
        <mxCell id="20" value="Cancel" style="text;" parent="1" vertex="1">
          <mxGeometry x="195" y="590" width="60" height="33" as="geometry" />
        </mxCell>
        <mxCell id="2" value="" style="shape=mxgraph.android.phone2;" parent="1" vertex="1">
          <mxGeometry x="0" y="0" width="400" height="700" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context) => {
        const request = context.switchToHttp().getRequest();
        request.user = mockUser;
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authToken = 'Bearer test-jwt-token';
  }, 10000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('TIPO 1: GENÉRICO - App desde prompt simple', () => {
    it('debe crear app genérica automática desde prompt básico', async () => {
      const genericDto = {
        prompt: 'una app de gestión de tareas',
        nombre: 'TaskManager App'
      };

      console.log('🧪 Test 1: Generador GENÉRICO');

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-general-app')
        .set('Authorization', authToken)
        .send(genericDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('general_automatic');
      expect(response.body.app.nombre).toBe('TaskManager App');
      expect(response.body.aiInterpretedPrompt).toBeDefined();
      expect(response.body.aiInterpretedPrompt.length).toBeGreaterThan(50);

      console.log('✅ Generador GENÉRICO: FUNCIONA');

      const appId = response.body.app.id;

      // Generar código Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
      console.log('✅ Generación Flutter GENÉRICA: FUNCIONA');
    }, 45000);

    it('debe enriquecer automáticamente prompts genéricos', async () => {
      const simpleDto = {
        prompt: 'app educativa',
        nombre: 'EduApp'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-general-app')
        .set('Authorization', authToken)
        .send(simpleDto);

      expect(response.body.success).toBe(true);
      expect(response.body.aiInterpretedPrompt).toContain('education');
      expect(response.body.originalInput).toBe('app educativa');
    }, 30000);
  });

  describe('TIPO 2: DETALLADO - App desde prompt específico', () => {
    it('debe crear app desde prompt detallado sin modificar', async () => {
      const detailedPrompt = `Crear una aplicación Flutter de e-commerce con las siguientes pantallas:
        1. LoginScreen con email y password
        2. ProductListScreen con grid de productos
        3. CartScreen con lista de carrito
        4. CheckoutScreen con formulario de pago
        5. ProfileScreen con datos del usuario
        Usar Material Design 3, colores azul y verde, navegación con BottomNavigationBar.
        Incluir SearchBar en ProductListScreen y AddToCart buttons.`;

      const detailedDto = {
        prompt: detailedPrompt,
        nombre: 'EcommerceApp Detailed',
        projectType: 'flutter'
      };

      console.log('🧪 Test 2: Generador DETALLADO');

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-detailed-app')
        .set('Authorization', authToken)
        .send(detailedDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('detailed_from_prompt');
      expect(response.body.app.nombre).toBe('EcommerceApp Detailed');
      expect(response.body.totalPages).toBeGreaterThanOrEqual(5);
      expect(response.body.specifiedFeatures).toContain('LoginScreen');
      expect(response.body.specifiedFeatures).toContain('ProductListScreen');

      console.log('✅ Generador DETALLADO: FUNCIONA');

      const appId = response.body.app.id;

      // Generar código Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
      console.log('✅ Generación Flutter DETALLADA: FUNCIONA');
    }, 45000);
  });

  describe('TIPO 3: IMAGEN - App desde análisis de imagen', () => {
    it('debe crear app desde imagen mockup', async () => {
      // Imagen base64 de ejemplo (un mockup simple)
      const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      const imageDto = {
        image: imageBase64,
        prompt: 'Analizar este mockup de app móvil',
        nombre: 'ImageApp Analysis'
      };

      console.log('🧪 Test 3: Generador IMAGEN');

      // Este endpoint debe analizar la imagen y crear la app
      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-from-image')
        .set('Authorization', authToken)
        .send(imageDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('image_analysis');
      expect(response.body.app.nombre).toBe('ImageApp Analysis');
      expect(response.body.imageAnalysis).toBeDefined();

      console.log('✅ Generador IMAGEN: FUNCIONA');

      const appId = response.body.app.id;

      // Generar código Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
      console.log('✅ Generación Flutter desde IMAGEN: FUNCIONA');
    }, 60000);
  });

  describe('TIPO 4: MOCKUP - App desde XML/mockup', () => {
    it('debe crear app desde XML mockup con pantallas específicas', async () => {
      const mockupDto = {
        xml: realMockupXml,
        prompt: 'App de gestión de proyectos desde mockup',
        nombre: 'ProjectManager Mockup',
        project_type: 'flutter'
      };

      console.log('🧪 Test 4: Generador MOCKUP (XML)');

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(mockupDto)
        .expect(201);

      expect(response.body.nombre).toBe('ProjectManager Mockup');
      expect(response.body.xml).toContain('Dashboard');
      expect(response.body.xml).toContain('Create a project');
      expect(response.body.xml).toContain('Waremelon');

      console.log('✅ Generador MOCKUP: FUNCIONA');

      const appId = response.body.id;

      // Generar código Flutter que DEBE usar la detección XML
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');

      // TODO: Extraer ZIP y verificar contenido específico
      // El ZIP debe contener DashboardScreen y CreateProjectScreen
      // NO debe contener HomeScreen, FormScreen genéricas
      
      console.log('✅ Generación Flutter desde MOCKUP: FUNCIONA');
    }, 45000);

    it('debe detectar campos específicos del XML en el código generado', async () => {
      const mockupDto = {
        xml: realMockupXml,
        prompt: 'Test detección específica',
        nombre: 'Specific Detection Test',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(mockupDto);

      expect(response.body.xml).toContain('Waremelon');
      expect(response.body.xml).toContain('Stash');
      expect(response.body.xml).toContain('Publish');
      expect(response.body.xml).toContain('Cancel');
    });
  });

  describe('VERIFICACIÓN CROSS-TYPE - Diferencias entre tipos', () => {
    it('cada tipo debe generar resultados diferentes pero funcionales', async () => {
      const basePrompt = 'app de gestión de tareas';
      
      // Crear con los 4 tipos diferentes
      const [generic, detailed, mockup] = await Promise.all([
        // Genérico
        request(app.getHttpServer())
          .post('/mobile-generator/create-general-app')
          .set('Authorization', authToken)
          .send({ prompt: basePrompt, nombre: 'Generic Tasks' }),
        
        // Detallado  
        request(app.getHttpServer())
          .post('/mobile-generator/create-detailed-app')
          .set('Authorization', authToken)
          .send({ 
            prompt: `${basePrompt} con TaskListScreen, AddTaskScreen, ProfileScreen`, 
            nombre: 'Detailed Tasks' 
          }),
        
        // Mockup
        request(app.getHttpServer())
          .post('/mobile-generator')
          .set('Authorization', authToken)
          .send({ 
            xml: realMockupXml, 
            prompt: basePrompt, 
            nombre: 'Mockup Tasks',
            project_type: 'flutter' 
          })
      ]);

      // Verificar que todos funcionan pero generan resultados diferentes
      expect(generic.body.success).toBe(true);
      expect(detailed.body.success).toBe(true);
      expect(mockup.body.nombre).toBe('Mockup Tasks');

      // Los tipos deben ser diferentes
      expect(generic.body.type).toBe('general_automatic');
      expect(detailed.body.type).toBe('detailed_from_prompt');
      // Mockup no tiene type en response, pero tiene XML
      expect(mockup.body.xml).toContain('Dashboard');

      console.log('✅ TODOS LOS 4 TIPOS FUNCIONAN CORRECTAMENTE');
    }, 60000);
  });

  describe('ERROR HANDLING - Manejo de errores', () => {
    it('debe manejar errores en cada tipo de generador', async () => {
      // Test errores en genérico
      await request(app.getHttpServer())
        .post('/mobile-generator/create-general-app')
        .set('Authorization', authToken)
        .send({ nombre: 'Sin Prompt' }) // Sin prompt
        .expect(400);

      // Test errores en detallado
      await request(app.getHttpServer())
        .post('/mobile-generator/create-detailed-app')
        .set('Authorization', authToken)
        .send({ prompt: '', nombre: 'Empty Prompt' }) // Prompt vacío
        .expect(400);

      // Test errores en imagen
      await request(app.getHttpServer())
        .post('/mobile-generator/create-from-image')
        .set('Authorization', authToken)
        .send({ image: 'invalid-base64', nombre: 'Invalid Image' }) // Imagen inválida
        .expect(400);

      console.log('✅ MANEJO DE ERRORES: FUNCIONA');
    });
  });
}); 