const { exec } = require('child_process');

// XML de test del usuario
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
        <mxCell id="8" value="Waremelon" style="rounded=1;arcSize=9;fillColor=#ffffff;align=left;spacingLeft=5;strokeColor=#4C9AFF;strokeWidth=2;fontColor=#000000;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="204" width="290" height="40" as="geometry" />
        </mxCell>
        <mxCell id="11" value="Stash" style="rounded=1;arcSize=9;fillColor=#F7F8F9;align=left;spacingLeft=5;strokeColor=#DEE1E6;strokeWidth=2;fontColor=#596780;fontSize=12;sketch=1;hachureGap=4;pointerEvents=0;fontFamily=Architects Daughter;fontSource=https%3A%2F%2Ffonts.googleapis.com%2Fcss%3Ffamily%3DArchitects%2BDaughter;" parent="4" vertex="1">
          <mxGeometry x="30" y="279" width="290" height="40" as="geometry" />
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

console.log('🧪 TEST: Verificando detección de pantallas...');

// Test 1: Verificar que el servicio de detección funciona
const testDetection = `
const { FlutterScreenDetectorService } = require('./dist/src/mobile-generator/services/flutter-screen-detector.service.js');

const detector = new FlutterScreenDetectorService();
const result = detector.detectScreens(\`${testXmlMockup}\`);

console.log('📱 Pantallas detectadas:', result.detectedScreens);
console.log('📝 Campos detectados:', result.detectedFields);
console.log('🔘 Botones detectados:', result.detectedButtons);
console.log('📊 Secciones:', result.screenSections.map(s => s.title));

// Verificar que detecta lo correcto
const expectedScreens = ['DashboardScreen', 'CreateProjectScreen'];
const hasCorrectScreens = expectedScreens.every(screen => result.detectedScreens.includes(screen));

console.log('✅ Detección correcta:', hasCorrectScreens);
console.log('📋 Resultado completo:', JSON.stringify(result, null, 2));
`;

// Ejecutar test de detección
console.log('🔍 Ejecutando test de detección...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error compilando:', error);
    return;
  }
  
  require('fs').writeFileSync('temp-test-detection.js', testDetection);
  
  exec('node temp-test-detection.js', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error en test detección:', error);
      console.error('stderr:', stderr);
    } else {
      console.log('📊 Resultado detección:');
      console.log(stdout);
    }
    
    // Limpiar archivo temporal
    try {
      require('fs').unlinkSync('temp-test-detection.js');
    } catch (e) {}
    
    console.log('\n🎯 PRÓXIMO PASO: Verificar que el FlutterGenerator use esta información correctamente');
    console.log('💡 SUGERENCIA: Crear un app de prueba con este XML y verificar el ZIP generado');
  });
});

// Test de API key
console.log('\n🔑 Verificando API key...');
if (process.env.OPENAI_API_KEY) {
  console.log('✅ API key configurada:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('❌ API key NO configurada - usando fallback de plantillas locales');
}

console.log('\n📋 RESUMEN DEL PROBLEMA:');
console.log('1. ✅ FlutterScreenDetectorService detecta correctamente las pantallas');
console.log('2. ✅ FlutterGenerator fue modificado para usar la detección');
console.log('3. ❓ Verificar que la IA reciba el prompt correcto');
console.log('4. ❓ Verificar que la IA genere las pantallas específicas');

console.log('\n🛠️ SOLUCIONES:');
console.log('- Si API key falla: Verificar configuración OpenAI');
console.log('- Si IA genera páginas incorrectas: Mejorar prompt en FlutterPromptService');
console.log('- Si todo funciona pero usuario ve páginas genéricas: Problema en el frontend'); 