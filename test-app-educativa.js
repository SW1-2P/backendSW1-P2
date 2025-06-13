const axios = require('axios');

async function testEducationApp() {
  try {
    console.log('🧪 Testeando generación automática de páginas para "una app educativa"...\n');

    // 1. PRUEBA: PromptEnrichmentService
    console.log('1️⃣ Testeando enriquecimiento del prompt...');
    const enrichResponse = await axios.post('http://localhost:3000/mobile-generator/analyze-image', {
      prompt: 'una app educativa'
    });

    console.log('✅ Prompt enriquecido generado:', enrichResponse.data.enrichedPrompt.substring(0, 200) + '...\n');

    // Verificar detección de dominio
    if (enrichResponse.data.enrichedPrompt.includes('EDUCACIÓN/ESCOLAR')) {
      console.log('🎯 ✅ Dominio educativo detectado correctamente');
    } else {
      console.log('❌ Error: Dominio educativo NO detectado');
      console.log('Texto del prompt:', enrichResponse.data.enrichedPrompt.substring(0, 500));
    }

    // Verificar páginas específicas
    const expectedPages = ['HomeScreen', 'CoursesScreen', 'AssignmentsScreen', 'GradesScreen', 'ScheduleScreen'];
    let pagesFound = 0;
    
    expectedPages.forEach(page => {
      if (enrichResponse.data.enrichedPrompt.includes(page)) {
        console.log(`📱 ✅ ${page} detectada`);
        pagesFound++;
      } else {
        console.log(`📱 ❌ ${page} NO detectada`);
      }
    });

    console.log(`\n📊 Resultado: ${pagesFound}/${expectedPages.length} páginas educativas detectadas\n`);

    // 2. SIMULACIÓN: Proceso de generación Flutter
    console.log('2️⃣ Simulando proceso de generación Flutter...');
    
    // Extraer líneas que contienen las páginas
    const pageLines = enrichResponse.data.enrichedPrompt
      .split('\n')
      .filter(line => line.match(/^\d+\.\s*\w+Screen:/));
    
    console.log('📋 Páginas que debería extraer el FlutterPromptService:');
    pageLines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.trim()}`);
    });

    if (pageLines.length >= 5) {
      console.log('\n🎉 ✅ ÉXITO: Sistema genera mínimo 5 páginas específicas para educación');
    } else {
      console.log('\n❌ FALLO: Sistema no genera suficientes páginas específicas');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testEducationApp(); 