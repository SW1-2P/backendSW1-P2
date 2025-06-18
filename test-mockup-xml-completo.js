const { exec } = require('child_process');

// XML mockup completo del usuario con 3 pantallas y múltiples componentes
const testXmlMockupCompleto = `<mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36" version="27.1.6">
  <diagram id="mockup-diagram" name="Mockup">
    <mxGraphModel dx="1285" dy="778" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="4" value="" style="group" parent="1" vertex="1" connectable="0">
          <mxGeometry x="10" y="40" width="400" height="760" as="geometry" />
        </mxCell>
        <mxCell id="3" value="Proyect" style="text;strokeColor=none;align=center;fillColor=none;verticalAlign=middle;rounded=0;" parent="4" vertex="1">
          <mxGeometry x="155" y="70" width="60" height="30" as="geometry" />
        </mxCell>
        <mxCell id="5" value="Create a project" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#172B4C;fontStyle=1;fontSize=18;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="109" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="6" value="Projects are where your repositories live. They ar&#xa;e containers you can group similar repositories in &#xa; better code organisations." style="fillColor=none;align=left;strokeColor=none;fontColor=#000000;fontSize=12;verticalAlign=top;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="129" width="310" height="29" as="geometry" />
        </mxCell>
        <mxCell id="7" value="Proyect" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="179" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="8" value="Waremelon" style="rounded=1;arcSize=9;fillColor=#ffffff;align=left;spacingLeft=5;strokeColor=#4C9AFF;strokeWidth=2;fontColor=#000000;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="204" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="9" value="Key&lt;sup&gt;&lt;font color=&quot;#ff0000&quot;&gt;*&lt;/font&gt;&lt;/sup&gt;" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="254" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="10" value="BETA" style="fillColor=#CCE0FF;strokeColor=none;fontSize=11;align=center;fontColor=#4C9AFF;fontStyle=1;fontSize=11;rounded=1;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="280" y="254" width="40" height="20" as="geometry" />
        </mxCell>
        <mxCell id="11" value="Stash" style="rounded=1;arcSize=9;fillColor=#F7F8F9;align=left;spacingLeft=5;strokeColor=#DEE1E6;strokeWidth=2;fontColor=#596780;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="279" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="12" value="Description" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#596780;fontStyle=1;fontSize=11;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="329" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="13" value="What is important for people to know?" style="rounded=1;arcSize=4;fillColor=#F7F8F9;align=left;spacingLeft=5;strokeColor=#DEE1E6;strokeWidth=2;fontColor=#596780;fontSize=12;verticalAlign=top;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="360" width="320" height="109" as="geometry" />
        </mxCell>
        <mxCell id="14" value="Project permissions" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#172B4C;fontStyle=1;fontSize=14;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="489" width="240" height="20" as="geometry" />
        </mxCell>
        <mxCell id="15" value="User access" style="fillColor=none;strokeColor=none;fontSize=11;fontStyle=0;align=left;fontColor=#172B4C;fontStyle=0;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="509" width="240" height="20" as="geometry" />
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
          <mxGeometry width="400" height="770" as="geometry" />
        </mxCell>
        <mxCell id="24" value="" style="group" parent="1" vertex="1" connectable="0">
          <mxGeometry x="440" y="40" width="390" height="780" as="geometry" />
        </mxCell>
        <mxCell id="21" value="" style="verticalLabelPosition=bottom;verticalAlign=top;shadow=0;dashed=0;strokeWidth=1;shape=mxgraph.android.phone2;strokeColor=#c0c0c0;" parent="24" vertex="1">
          <mxGeometry width="379.4594594594594" height="780" as="geometry" />
        </mxCell>
        <mxCell id="22" value="Dasboard" style="text;strokeColor=none;align=center;fillColor=none;verticalAlign=middle;rounded=0;" parent="24" vertex="1">
          <mxGeometry x="147.56756756756755" y="100" width="63.243243243243235" height="30" as="geometry" />
        </mxCell>
        <mxCell id="23" value="Primary" style="rounded=1;fillColor=#0057D8;strokeColor=none;fontColor=#ffffff;align=center;verticalAlign=middle;fontStyle=0;fontSize=12;sketch=0;" parent="24" vertex="1">
          <mxGeometry x="144.4054054054054" y="630" width="90.64864864864865" height="33" as="geometry" />
        </mxCell>
        <mxCell id="38" value="Option 1" style="strokeWidth=1;shadow=0;dashed=0;align=center;shape=mxgraph.mockup.forms.comboBox;strokeColor=#999999;fillColor=#ddeeff;align=left;fillColor2=#aaddff;mainText=;fontColor=#666666;fontSize=17;spacingLeft=3;" parent="24" vertex="1">
          <mxGeometry x="120.00000000000006" y="340" width="150" height="30" as="geometry" />
        </mxCell>
        <mxCell id="36" value="" style="group" parent="1" vertex="1" connectable="0">
          <mxGeometry x="850" y="40" width="420" height="780" as="geometry" />
        </mxCell>
        <mxCell id="25" value="" style="verticalLabelPosition=bottom;verticalAlign=top;shadow=0;dashed=0;strokeWidth=1;shape=mxgraph.android.phone2;strokeColor=#c0c0c0;" parent="36" vertex="1">
          <mxGeometry width="420" height="780" as="geometry" />
        </mxCell>
        <mxCell id="26" value="Table" style="shape=table;startSize=30;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=0;strokeColor=default;fontSize=16;" parent="36" vertex="1">
          <mxGeometry x="140" y="230" width="180" height="120" as="geometry" />
        </mxCell>
        <mxCell id="27" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;top=0;left=0;bottom=0;right=0;collapsible=0;dropTarget=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;strokeColor=inherit;fontSize=16;" parent="26" vertex="1">
          <mxGeometry y="30" width="180" height="30" as="geometry" />
        </mxCell>
        <mxCell id="28" value="1" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;pointerEvents=1;strokeColor=inherit;fontSize=16;" parent="27" vertex="1">
          <mxGeometry width="40" height="30" as="geometry">
            <mxRectangle width="40" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="29" value="Value 1" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;overflow=hidden;strokeColor=inherit;fontSize=16;" parent="27" vertex="1">
          <mxGeometry x="40" width="140" height="30" as="geometry">
            <mxRectangle width="140" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="30" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;top=0;left=0;bottom=0;right=0;collapsible=0;dropTarget=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;strokeColor=inherit;fontSize=16;" parent="26" vertex="1">
          <mxGeometry y="60" width="180" height="30" as="geometry" />
        </mxCell>
        <mxCell id="31" value="2" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;strokeColor=inherit;fontSize=16;" parent="30" vertex="1">
          <mxGeometry width="40" height="30" as="geometry">
            <mxRectangle width="40" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="32" value="Value 2" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;overflow=hidden;strokeColor=inherit;fontSize=16;" parent="30" vertex="1">
          <mxGeometry x="40" width="140" height="30" as="geometry">
            <mxRectangle width="140" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="33" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;top=0;left=0;bottom=0;right=0;collapsible=0;dropTarget=0;fillColor=none;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;strokeColor=inherit;fontSize=16;" parent="26" vertex="1">
          <mxGeometry y="90" width="180" height="30" as="geometry" />
        </mxCell>
        <mxCell id="34" value="3" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;strokeColor=inherit;fontSize=16;" parent="33" vertex="1">
          <mxGeometry width="40" height="30" as="geometry">
            <mxRectangle width="40" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="35" value="Value 3" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;overflow=hidden;strokeColor=inherit;fontSize=16;" parent="33" vertex="1">
          <mxGeometry x="40" width="140" height="30" as="geometry">
            <mxRectangle width="140" height="30" as="alternateBounds" />
          </mxGeometry>
        </mxCell>
        <mxCell id="37" value="Table" style="text;strokeColor=none;align=center;fillColor=none;verticalAlign=middle;rounded=0;" parent="36" vertex="1">
          <mxGeometry x="175" y="100" width="60" height="30" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Función para probar la generación de app desde XML mockup completo
function testGenerateFromMockupXML() {
  console.log('🧪 Probando generación desde XML mockup completo...');
  console.log(`📋 XML contiene ${testXmlMockupCompleto.length} caracteres`);
  console.log(`📱 Pantallas detectadas en XML: ${(testXmlMockupCompleto.match(/shape=mxgraph\.android\.phone2/g) || []).length}`);
  console.log(`🎨 Colores detectados: ${(testXmlMockupCompleto.match(/fillColor=#[A-F0-9]{6}/g) || []).join(', ')}`);
  console.log(`📝 Elementos de texto: ${(testXmlMockupCompleto.match(/value="[^"]+"/g) || []).length}`);
  console.log(`🔘 Radio buttons: ${(testXmlMockupCompleto.match(/shape=ellipse/g) || []).length}`);
  console.log(`📊 Tablas: ${(testXmlMockupCompleto.match(/shape=table/g) || []).length}`);
  
  const payload = {
    nombre: 'Test Mockup XML Completo',
    xml: testXmlMockupCompleto,
    project_type: 'flutter',
    config: {
      includeTests: false,
      useDrawer: true, // Forzar drawer porque hay 3 pantallas
      colors: ['#0057D8', '#4C9AFF', '#CCE0FF', '#F7F8F9', '#DEE1E6']
    }
  };

  console.log('\n📤 Enviando payload para crear app...');
  console.log(`   - Nombre: ${payload.nombre}`);
  console.log(`   - XML: ${payload.xml.length} caracteres`);
  console.log(`   - Colores: ${payload.config.colors?.join(', ')}`);

  exec(`curl -X POST http://localhost:3000/mobile-generator \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
    -d '${JSON.stringify(payload)}'`, (error, stdout, stderr) => {
    
    if (error) {
      console.error('❌ Error ejecutando curl:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Stderr:', stderr);
    }
    
    try {
      const response = JSON.parse(stdout);
      console.log('\n✅ Respuesta del servidor:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.id) {
        console.log(`\n🔗 Para generar el proyecto: GET /mobile-generator/${response.id}/generate`);
      }
    } catch (parseError) {
      console.log('📄 Respuesta del servidor (raw):');
      console.log(stdout);
    }
  });
}

// Función para verificar que el XML contiene todos los elementos esperados
function validateXMLContent() {
  console.log('\n🔍 Validando contenido del XML...');
  
  const validations = [
    {
      name: 'Pantallas móviles',
      test: () => (testXmlMockupCompleto.match(/shape=mxgraph\.android\.phone2/g) || []).length,
      expected: 3,
      description: 'Debe contener 3 pantallas móviles'
    },
    {
      name: 'Formulario de proyecto',
      test: () => testXmlMockupCompleto.includes('Create a project'),
      expected: true,
      description: 'Debe incluir título "Create a project"'
    },
    {
      name: 'Campos de entrada',
      test: () => testXmlMockupCompleto.includes('Waremelon') && testXmlMockupCompleto.includes('Stash'),
      expected: true,
      description: 'Debe incluir campos de entrada específicos'
    },
    {
      name: 'Radio buttons de permisos',
      test: () => testXmlMockupCompleto.includes('Read and write') && testXmlMockupCompleto.includes('Read only') && testXmlMockupCompleto.includes('None'),
      expected: true,
      description: 'Debe incluir radio buttons para permisos'
    },
    {
      name: 'Botones de acción',
      test: () => testXmlMockupCompleto.includes('Publish') && testXmlMockupCompleto.includes('Cancel'),
      expected: true,
      description: 'Debe incluir botones Publish y Cancel'
    },
    {
      name: 'Dashboard screen',
      test: () => testXmlMockupCompleto.includes('Dasboard'),
      expected: true,
      description: 'Debe incluir pantalla Dashboard'
    },
    {
      name: 'Tabla de datos',
      test: () => testXmlMockupCompleto.includes('shape=table'),
      expected: true,
      description: 'Debe incluir tabla con datos'
    },
    {
      name: 'Dropdown/ComboBox',
      test: () => testXmlMockupCompleto.includes('shape=mxgraph.mockup.forms.comboBox'),
      expected: true,
      description: 'Debe incluir dropdown/combobox'
    }
  ];
  
  validations.forEach(validation => {
    const result = validation.test();
    const status = result === validation.expected ? '✅' : '❌';
    console.log(`${status} ${validation.name}: ${result} (esperado: ${validation.expected})`);
    console.log(`   ${validation.description}`);
  });
  
  console.log('\n📊 Resumen de elementos detectados:');
  console.log(`   - Pantallas: ${(testXmlMockupCompleto.match(/shape=mxgraph\.android\.phone2/g) || []).length}`);
  console.log(`   - Textos: ${(testXmlMockupCompleto.match(/value="[^"]+"/g) || []).length}`);
  console.log(`   - Colores: ${(testXmlMockupCompleto.match(/fillColor=#[A-F0-9]{6}/g) || []).length}`);
  console.log(`   - Elementos interactivos: ${(testXmlMockupCompleto.match(/shape=ellipse|shape=table|comboBox/g) || []).length}`);
}

// Ejecutar validaciones
validateXMLContent();

// Ejecutar prueba (comentar la línea siguiente si no tienes el servidor corriendo)
// testGenerateFromMockupXML();

module.exports = {
  testXmlMockupCompleto,
  testGenerateFromMockupXML,
  validateXMLContent
}; 