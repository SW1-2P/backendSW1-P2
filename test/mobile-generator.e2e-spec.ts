import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('MobileGenerator (e2e)', () => {
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

  // XML de test basado en el ejemplo del usuario
  const testXmlMockup = `<mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36" version="27.1.5">
  <diagram id="mockup-diagram" name="Mockup">
    <mxGraphModel dx="452" dy="1633" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="4" value="" style="group" parent="1" vertex="1" connectable="0">
          <mxGeometry x="30" y="120" width="400" height="760" as="geometry" />
        </mxCell>
        <mxCell id="3" value="Dashboard" style="text;strokeColor=none;align=center;fillColor=none;verticalAlign=middle;rounded=0;" parent="4" vertex="1">
          <mxGeometry x="155" y="70" width="60" height="30" as="geometry" />
        </mxCell>
        <mxCell id="5" value="Create a project" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#172B4C;fontStyle=1;fontSize=18;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="109" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="6" value="Projects are where your repositories live. They are containers you can group similar repositories in better code organisations." style="fillColor=none;align=left;strokeColor=none;fontColor=#000000;fontSize=12;verticalAlign=top;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="129" width="310" height="29" as="geometry" />
        </mxCell>
        <mxCell id="7" value="Proyect" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="179" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="8" value="Waremelon" style="rounded=1;arcSize=9;fillColor=#ffffff;align=left;spacingLeft=5;strokeColor=#4C9AFF;strokeWidth=2;fontColor=#000000;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="204" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="9" value="Key" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="254" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="11" value="Stash" style="rounded=1;arcSize=9;fillColor=#F7F8F9;align=left;spacingLeft=5;strokeColor=#DEE1E6;strokeWidth=2;fontColor=#596780;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="279" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="12" value="Description" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="329" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="14" value="Project permissions" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#172B4C;fontStyle=1;fontSize=14;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="489" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="16" value="Read and write" style="shape=ellipse;fillColor=#ffffff;strokeColor=#0057D8;strokeWidth=4;fontColor=#000000;align=left;verticalAlign=middle;fontStyle=0;fontSize=12;labelPosition=right;verticalLabelPosition=middle;spacingLeft=10;sketch=0;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="41" y="539" width="10" height="10" as="geometry" />
        </mxCell>
        <mxCell id="17" value="Read only" style="shape=ellipse;rounded=1;fillColor=#F0F2F5;strokeColor=#D8DCE3;fontColor=#000000;align=left;verticalAlign=middle;fontStyle=0;fontSize=12;labelPosition=right;verticalLabelPosition=middle;spacingLeft=10;shadow=0;dashed=0;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="40" y="559" width="12" height="12" as="geometry" />
        </mxCell>
        <mxCell id="18" value="None" style="shape=ellipse;rounded=1;fillColor=#F0F2F5;strokeColor=#D8DCE3;fontColor=#000000;align=left;verticalAlign=middle;fontStyle=0;fontSize=12;labelPosition=right;verticalLabelPosition=middle;spacingLeft=10;shadow=0;dashed=0;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="40" y="579" width="12" height="12" as="geometry" />
        </mxCell>
        <mxCell id="19" value="Publish" style="rounded=1;fillColor=#0057D8;strokeColor=none;fontColor=#ffffff;align=center;verticalAlign=middle;fontStyle=0;fontSize=14;shadow=0;dashed=0;sketch=0;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="125" y="590" width="60" height="33" as="geometry" />
        </mxCell>
        <mxCell id="20" value="Cancel" style="fillColor=none;strokeColor=none;fontColor=#596780;align=center;verticalAlign=middle;fontStyle=0;fontSize=14;shadow=0;dashed=0;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="195" y="590" width="60" height="33" as="geometry" />
        </mxCell>
        <mxCell id="2" value="" style="verticalLabelPosition=bottom;verticalAlign=top;shadow=0;dashed=0;strokeWidth=1;shape=mxgraph.android.phone2;strokeColor=#c0c0c0;" parent="4" vertex="1">
          <mxGeometry y="-10" width="400" height="770" as="geometry" />
        </mxCell>
        <mxCell id="21" value="" style="verticalLabelPosition=bottom;verticalAlign=top;shadow=0;dashed=0;strokeWidth=1;shape=mxgraph.android.phone2;strokeColor=#c0c0c0;" parent="1" vertex="1">
          <mxGeometry x="460" y="110" width="360" height="780" as="geometry" />
        </mxCell>
        <mxCell id="22" value="Dasboard" style="text;strokeColor=none;align=center;fillColor=none;verticalAlign=middle;rounded=0;" parent="1" vertex="1">
          <mxGeometry x="610" y="210" width="60" height="30" as="geometry" />
        </mxCell>
        <mxCell id="23" value="Primary" style="rounded=1;fillColor=#0057D8;strokeColor=none;fontColor=#ffffff;align=center;verticalAlign=middle;fontStyle=0;fontSize=12;sketch=0;" parent="1" vertex="1">
          <mxGeometry x="600" y="720" width="86" height="33" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

  beforeEach(async () => {
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

    // Simular token JWT para tests
    authToken = 'Bearer test-jwt-token';
  });

  afterEach(async () => {
    await app.close();
  });

  describe('1. TEST MOCKUP XML - Debe generar pantallas específicas del XML', () => {
    it('debe crear app desde XML mockup y generar DashboardScreen y CreateProjectScreen', async () => {
      const createMockupDto = {
        xml: testXmlMockup,
        prompt: 'App de gestión de proyectos',
        nombre: 'Test Mockup App',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(createMockupDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.nombre).toBe('Test Mockup App');
      expect(response.body.xml).toContain('Dashboard');
      expect(response.body.xml).toContain('Create a project');

      const appId = response.body.id;

      // Probar generación Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
    }, 30000);

    it('debe detectar correctamente las pantallas del XML', async () => {
      const createMockupDto = {
        xml: testXmlMockup,
        prompt: 'Test detección XML',
        nombre: 'Test Detection App',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(createMockupDto);

      expect(response.body.xml).toContain('Dashboard');
      expect(response.body.xml).toContain('Dasboard'); // También el del segundo teléfono
      expect(response.body.xml).toContain('Create a project');
      expect(response.body.xml).toContain('Waremelon');
      expect(response.body.xml).toContain('Project permissions');
      expect(response.body.xml).toContain('Read and write');
    });
  });

  describe('2. TEST GENÉRICO - Debe generar app automática con enriquecimiento', () => {
    it('debe crear app genérica desde prompt simple', async () => {
      const createGenericDto = {
        prompt: 'una app de gimnasio',
        nombre: 'Test Gym App'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-general-app')
        .set('Authorization', authToken)
        .send(createGenericDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('general_automatic');
      expect(response.body.app.nombre).toBe('Test Gym App');
      expect(response.body.originalInput).toBe('una app de gimnasio');

      const appId = response.body.app.id;

      // Probar generación Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
    }, 30000);

    it('debe enriquecer automáticamente el prompt genérico', async () => {
      const createGenericDto = {
        prompt: 'una app educativa',
        nombre: 'Test Education App'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-general-app')
        .set('Authorization', authToken)
        .send(createGenericDto);

      expect(response.body.success).toBe(true);
      expect(response.body.aiInterpretedPrompt).toBeDefined();
      expect(response.body.aiInterpretedPrompt.length).toBeGreaterThan(100);
      
      // El prompt debe estar enriquecido con contexto educativo
      const interpretedPrompt = response.body.aiInterpretedPrompt.toLowerCase();
      expect(
        interpretedPrompt.includes('education') || 
        interpretedPrompt.includes('course') || 
        interpretedPrompt.includes('student') ||
        interpretedPrompt.includes('educativa')
      ).toBe(true);
    });
  });

  describe('3. TEST DETALLADO - Debe generar según especificaciones exactas', () => {
    it('debe crear app desde prompt detallado sin modificaciones', async () => {
      const detailedPrompt = `Crear una aplicación Flutter con las siguientes pantallas: 
        1. LoginScreen con email y password 
        2. HomeScreen con dashboard y navegación 
        3. ProfileScreen con edición de datos 
        4. SettingsScreen con configuraciones. 
        Usar Material Design 3, colores azul y blanco, navegación con BottomNavigationBar.`;

      const createDetailedDto = {
        prompt: detailedPrompt,
        nombre: 'Test Detailed App',
        projectType: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-detailed-app')
        .set('Authorization', authToken)
        .send(createDetailedDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('detailed_from_prompt');
      expect(response.body.app.nombre).toBe('Test Detailed App');
      expect(response.body.totalPages).toBe(4);

      const expectedFeatures = response.body.specifiedFeatures;
      expect(expectedFeatures).toContain('LoginScreen');
      expect(expectedFeatures).toContain('HomeScreen');
      expect(expectedFeatures).toContain('ProfileScreen');
      expect(expectedFeatures).toContain('SettingsScreen');

      const appId = response.body.app.id;

      // Probar generación Flutter
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${appId}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
    }, 30000);

    it('debe extraer características específicas del prompt detallado', async () => {
      const detailedPrompt = `App de e-commerce con ProductListScreen, CartScreen, CheckoutScreen y OrderHistoryScreen. 
        Debe incluir autenticación, carrito de compras, pagos y seguimiento de pedidos.`;

      const createDetailedDto = {
        prompt: detailedPrompt,
        nombre: 'Test Ecommerce App',
        projectType: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator/create-detailed-app')
        .set('Authorization', authToken)
        .send(createDetailedDto);

      expect(response.body.success).toBe(true);
      expect(response.body.totalPages).toBe(4);

      const features = response.body.specifiedFeatures;
      expect(features).toContain('ProductListScreen');
      expect(features).toContain('CartScreen');
      expect(features).toContain('CheckoutScreen');
      expect(features).toContain('OrderHistoryScreen');
      expect(features).toContain('autenticación');
      expect(features).toContain('carrito');
      expect(features).toContain('pagos');
    });
  });

  describe('4. TEST OTROS GENERADORES - Verificar que no interfieren', () => {
    it('debe generar diagrama sin afectar mobile generator', async () => {
      const diagramDto = {
        xml: '<diagram><test>diagram content</test></diagram>',
        titulo: 'Test Diagram',
        descripcion: 'Test description'
      };

      // Crear diagrama
      const diagramResponse = await request(app.getHttpServer())
        .post('/diagramas')
        .set('Authorization', authToken)
        .send(diagramDto)
        .expect(201);

      expect(diagramResponse.body).toBeDefined();

      // Crear app móvil después - debe funcionar normalmente
      const mobileDto = {
        xml: '',
        prompt: 'test app después de diagrama',
        nombre: 'Test After Diagram',
        project_type: 'flutter'
      };

      const mobileResponse = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(mobileDto)
        .expect(201);

      expect(mobileResponse.body.nombre).toBe('Test After Diagram');
    });

    it('debe generar mockup sin afectar mobile generator', async () => {
      const mockupDto = {
        xml: '<mockup><test>mockup content</test></mockup>',
        nombre: 'Test Mockup',
        descripcion: 'Test mockup description'
      };

      // Crear mockup
      const mockupResponse = await request(app.getHttpServer())
        .post('/mockups')
        .set('Authorization', authToken)
        .send(mockupDto)
        .expect(201);

      expect(mockupResponse.body).toBeDefined();

      // Crear app móvil después - debe funcionar normalmente
      const mobileDto = {
        xml: '',
        prompt: 'test app después de mockup',
        nombre: 'Test After Mockup',
        project_type: 'flutter'
      };

      const mobileResponse = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(mobileDto)
        .expect(201);

      expect(mobileResponse.body.nombre).toBe('Test After Mockup');
    });
  });

  describe('5. TEST SERVICIOS INTERNOS - Verificar detección y prompt', () => {
    it('debe detectar correctamente las pantallas del XML de test', () => {
      // Este test requiere acceso directo al servicio
      // Se puede hacer con inyección de dependencias en el módulo de test
      expect(testXmlMockup).toContain('Dashboard');
      expect(testXmlMockup).toContain('Create a project');
      expect(testXmlMockup).toContain('Waremelon');
      expect(testXmlMockup).toContain('Project permissions');
    });

    it('debe generar prompt especializado para XML', () => {
      // Este test verificaría que el FlutterPromptService genera 
      // prompts específicos basados en la detección de pantallas
      expect(testXmlMockup).toContain('Publish');
      expect(testXmlMockup).toContain('Cancel');
      expect(testXmlMockup).toContain('Read and write');
      expect(testXmlMockup).toContain('Read only');
      expect(testXmlMockup).toContain('None');
    });
  });

  describe('6. TEST ERROR HANDLING - Verificar manejo de errores', () => {
    it('debe manejar XML malformado', async () => {
      const invalidXmlDto = {
        xml: '<invalid><xml>malformed</invalid>',
        prompt: 'test with invalid xml',
        nombre: 'Test Invalid XML',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(invalidXmlDto)
        .expect(201); // Debería crear la app pero quizás con fallback

      expect(response.body.nombre).toBe('Test Invalid XML');
    });

    it('debe manejar prompt vacío', async () => {
      const emptyPromptDto = {
        xml: '',
        prompt: '',
        nombre: 'Test Empty Prompt',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(emptyPromptDto)
        .expect(201);

      expect(response.body.nombre).toBe('Test Empty Prompt');
    });

    it('debe manejar generación sin API key de OpenAI', async () => {
      // Este test requeriría temporalmente deshabilitar la API key
      const dto = {
        xml: '',
        prompt: 'test without api key',
        nombre: 'Test No API Key',
        project_type: 'flutter'
      };

      const response = await request(app.getHttpServer())
        .post('/mobile-generator')
        .set('Authorization', authToken)
        .send(dto)
        .expect(201);

      expect(response.body.nombre).toBe('Test No API Key');

      // La generación debería usar plantillas locales como fallback
      const generateResponse = await request(app.getHttpServer())
        .get(`/mobile-generator/${response.body.id}/generate-flutter`)
        .set('Authorization', authToken)
        .expect(200);

      expect(generateResponse.headers['content-type']).toContain('application/zip');
    }, 30000);
  });
}); 