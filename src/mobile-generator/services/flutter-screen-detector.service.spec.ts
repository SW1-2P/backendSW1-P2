import { Test, TestingModule } from '@nestjs/testing';
import { FlutterScreenDetectorService } from './flutter-screen-detector.service';

describe('FlutterScreenDetectorService', () => {
  let service: FlutterScreenDetectorService;

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlutterScreenDetectorService],
    }).compile();

    service = module.get<FlutterScreenDetectorService>(FlutterScreenDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Detección de XML de Usuario Real', () => {
    it('debe detectar 2 teléfonos en el XML', () => {
      const result = service.detectScreens(testXmlMockup);
      
      expect(result.phoneCount).toBe(2);
      expect(result.hasMultipleScreens).toBe(true);
      expect(result.shouldCreateDrawer).toBe(true);
    });

    it('debe detectar las pantallas específicas: DashboardScreen y CreateProjectScreen', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('🔍 Pantallas detectadas:', result.detectedScreens);
      console.log('🔍 Secciones:', result.screenSections.map(s => ({
        title: s.title,
        texts: s.texts,
        fields: s.fields,
        buttons: s.buttons
      })));
      
      // Verificar que detecta las pantallas correctas
      expect(result.detectedScreens).toContain('DashboardScreen');
      expect(result.detectedScreens).toContain('CreateProjectScreen');
      
      // NO debe detectar pantallas genéricas
      expect(result.detectedScreens).not.toContain('HomeScreen');
      expect(result.detectedScreens).not.toContain('FormScreen');
      expect(result.detectedScreens).not.toContain('DetailScreen');
    });

    it('debe detectar los campos específicos del formulario', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('📝 Campos detectados:', result.detectedFields);
      
      // Verificar campos específicos del XML
      expect(result.detectedFields).toContain('Waremelon');
      expect(result.detectedFields).toContain('Stash');
      expect(result.detectedFields).toContain('Key');
      expect(result.detectedFields).toContain('Description');
    });

    it('debe detectar los botones específicos', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('🔘 Botones detectados:', result.detectedButtons);
      
      // Verificar botones específicos del XML
      expect(result.detectedButtons).toContain('Publish');
      expect(result.detectedButtons).toContain('Cancel');
      expect(result.detectedButtons).toContain('Primary');
    });

    it('debe detectar los radio buttons de permisos', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('📻 Radio groups detectados:', result.detectedRadioGroups);
      
      // Verificar que detecta los radio buttons
      const radioTexts = result.detectedRadioGroups
        .flatMap(group => group.options.map(option => option.text));
      
      expect(radioTexts).toContain('Read and write');
      expect(radioTexts).toContain('Read only');
      expect(radioTexts).toContain('None');
    });

    it('debe detectar textos específicos del mockup', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('📄 Textos detectados:', result.allTexts.slice(0, 10));
      
      // Verificar textos específicos
      expect(result.allTexts).toContain('Dashboard');
      expect(result.allTexts).toContain('Create a project');
      expect(result.allTexts).toContain('Project permissions');
      expect(result.allTexts).toContain('Projects are where your repositories live');
    });

    it('debe crear secciones de pantallas específicas', () => {
      const result = service.detectScreens(testXmlMockup);
      
      console.log('📱 Secciones de pantallas:', result.screenSections);
      
      expect(result.screenSections.length).toBeGreaterThan(0);
      
      // Verificar que las secciones tienen títulos correctos
      const sectionTitles = result.screenSections.map(s => s.title);
      expect(sectionTitles).toContain('DashboardScreen');
      expect(sectionTitles).toContain('CreateProjectScreen');
      
      // Verificar contenido de la sección CreateProject
      const createProjectSection = result.screenSections.find(s => s.title === 'CreateProjectScreen');
      if (createProjectSection) {
        expect(createProjectSection.fields).toContain('Waremelon');
        expect(createProjectSection.fields).toContain('Stash');
        expect(createProjectSection.buttons).toContain('Publish');
        expect(createProjectSection.buttons).toContain('Cancel');
      }
    });

    it('debe detectar contenido de proyecto (no genérico)', () => {
      const result = service.detectScreens(testXmlMockup);
      
      // Debe detectar que es contenido de proyecto
      expect(result.hasProjectContent).toBe(true);
      
      // No debe detectar como contenido de registro genérico
      expect(result.hasRegisterContent).toBe(false);
    });
  });

  describe('Comparación con XML Genérico', () => {
    const genericXml = `<mxfile>
      <diagram>
        <mxGraphModel>
          <root>
            <mxCell value="Home" />
            <mxCell value="Settings" />
            <mxCell value="Profile" />
          </root>
        </mxGraphModel>
      </diagram>
    </mxfile>`;

    it('debe diferenciar entre XML específico y genérico', () => {
      const specificResult = service.detectScreens(testXmlMockup);
      const genericResult = service.detectScreens(genericXml);
      
      // El XML específico debe tener más elementos detectados
      expect(specificResult.detectedFields.length).toBeGreaterThan(genericResult.detectedFields.length);
      expect(specificResult.detectedButtons.length).toBeGreaterThan(genericResult.detectedButtons.length);
      expect(specificResult.screenSections.length).toBeGreaterThan(0);
    });
  });

  describe('Casos Edge', () => {
    it('debe manejar XML vacío sin errores', () => {
      const result = service.detectScreens('');
      
      expect(result).toBeDefined();
      expect(result.phoneCount).toBe(0);
      expect(result.hasMultipleScreens).toBe(false);
      expect(result.detectedScreens).toEqual([]);
    });

    it('debe manejar XML malformado sin errores', () => {
      const malformedXml = '<invalid><xml>content</invalid>';
      
      const result = service.detectScreens(malformedXml);
      
      expect(result).toBeDefined();
      expect(result.phoneCount).toBe(0);
    });
  });
}); 