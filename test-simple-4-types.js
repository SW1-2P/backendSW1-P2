const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNjMjYzNGFkLTM3OTAtNDg3ZS04MjllLTA4NjFiYTQ4ZWYxNyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbCI6ImFkbWluIiwiaWF0IjoxNzUwMTUxNzIxLCJleHAiOjE3NTAyMzgxMjF9.c4GJZfyZskE72xg1bzWM_hPkdvTpaTQaUZKlD-TMkUI';

// Mock user para testing
const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  nombre: 'Test User'
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

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': AUTH_TOKEN
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Si es una respuesta de ZIP (generate-flutter), no parsear como JSON
    if (endpoint.includes('generate-flutter')) {
      return {
        status: response.status,
        ok: response.ok,
        isZip: true,
        contentType: response.headers.get('content-type')
      };
    }
    
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error.message);
    return {
      status: 500,
      ok: false,
      error: error.message
    };
  }
}

async function testTipo1Generico() {
  console.log('\n🧪 TEST TIPO 1: GENÉRICO');
  console.log('=====================================');

  const genericDto = {
    prompt: 'una app de gestión de tareas',
    nombre: 'TaskManager App'
  };

  const result = await makeRequest('/mobile-generator/create-general-app', 'POST', genericDto);
  
  if (result.ok) {
    console.log('✅ Generador GENÉRICO: FUNCIONANDO');
    console.log('📊 Respuesta:', {
      success: result.data.success,
      type: result.data.type,
      nombre: result.data.app?.nombre,
      hasAiPrompt: !!result.data.aiInterpretedPrompt
    });
    return result.data.app?.id;
  } else {
    console.log('❌ Generador GENÉRICO: ERROR');
    console.log('📊 Error:', result.data);
    return null;
  }
}

async function testTipo2Detallado() {
  console.log('\n🧪 TEST TIPO 2: DETALLADO');
  console.log('=====================================');

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

  const result = await makeRequest('/mobile-generator/create-detailed-app', 'POST', detailedDto);
  
  if (result.ok) {
    console.log('✅ Generador DETALLADO: FUNCIONANDO');
    console.log('📊 Respuesta:', {
      success: result.data.success,
      type: result.data.type,
      nombre: result.data.app?.nombre,
      totalPages: result.data.totalPages
    });
    return result.data.app?.id;
  } else {
    console.log('❌ Generador DETALLADO: ERROR');
    console.log('📊 Error:', result.data);
    return null;
  }
}

async function testTipo3Imagen() {
  console.log('\n🧪 TEST TIPO 3: IMAGEN');
  console.log('=====================================');

  // Imagen base64 de ejemplo (un pixel transparente)
  const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

  const imageDto = {
    image: imageBase64,
    prompt: 'Analizar este mockup de app móvil',
    nombre: 'ImageApp Analysis'
  };

  const result = await makeRequest('/mobile-generator/create-from-image', 'POST', imageDto);
  
  if (result.ok) {
    console.log('✅ Generador IMAGEN: FUNCIONANDO');
    console.log('📊 Respuesta:', {
      success: result.data.success,
      type: result.data.type,
      nombre: result.data.app?.nombre,
      hasAnalysis: !!result.data.imageAnalysis
    });
    return result.data.app?.id;
  } else {
    console.log('❌ Generador IMAGEN: ERROR');
    console.log('📊 Error:', result.data);
    return null;
  }
}

async function testTipo4Mockup() {
  console.log('\n🧪 TEST TIPO 4: MOCKUP (XML)');
  console.log('=====================================');

  const mockupDto = {
    xml: realMockupXml,
    prompt: 'App de gestión de proyectos desde mockup',
    nombre: 'ProjectManager Mockup',
    project_type: 'flutter'
  };

  const result = await makeRequest('/mobile-generator', 'POST', mockupDto);
  
  if (result.ok) {
    console.log('✅ Generador MOCKUP: FUNCIONANDO');
    console.log('📊 Respuesta:', {
      nombre: result.data.nombre,
      hasDashboard: result.data.xml?.includes('Dashboard'),
      hasCreateProject: result.data.xml?.includes('Create a project'),
      hasWaremelon: result.data.xml?.includes('Waremelon')
    });
    return result.data.id;
  } else {
    console.log('❌ Generador MOCKUP: ERROR');
    console.log('📊 Error:', result.data);
    return null;
  }
}

async function testFlutterGeneration(appId, type) {
  if (!appId) {
    console.log(`❌ No se puede probar generación Flutter para ${type} - sin ID`);
    return false;
  }

  console.log(`\n🔧 TEST GENERACIÓN FLUTTER - ${type}`);
  console.log('=====================================');

  const result = await makeRequest(`/mobile-generator/${appId}/generate-flutter`, 'POST');
  
  if (result.ok) {
    console.log(`✅ Generación Flutter ${type}: FUNCIONANDO`);
    if (result.isZip) {
      console.log(`📦 Archivo ZIP generado correctamente - Content-Type: ${result.contentType}`);
    }
    return true;
  } else {
    console.log(`❌ Generación Flutter ${type}: ERROR`);
    console.log('📊 Error:', result.data || result.error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 INICIANDO TESTS DE LOS 4 TIPOS DE GENERADORES');
  console.log('=================================================');

  const results = {
    generico: null,
    detallado: null,
    imagen: null,
    mockup: null
  };

  // Test los 4 tipos
  results.generico = await testTipo1Generico();
  results.detallado = await testTipo2Detallado();
  results.imagen = await testTipo3Imagen();
  results.mockup = await testTipo4Mockup();

  // Test generación Flutter para cada tipo exitoso
  const flutterResults = {
    generico: await testFlutterGeneration(results.generico, 'GENÉRICO'),
    detallado: await testFlutterGeneration(results.detallado, 'DETALLADO'),
    imagen: await testFlutterGeneration(results.imagen, 'IMAGEN'),
    mockup: await testFlutterGeneration(results.mockup, 'MOCKUP')
  };

  // Resumen final
  console.log('\n📊 RESUMEN FINAL');
  console.log('=================');
  
  const tipos = ['generico', 'detallado', 'imagen', 'mockup'];
  const funcionando = tipos.filter(tipo => results[tipo] && flutterResults[tipo]);
  
  console.log(`✅ Tipos funcionando: ${funcionando.length}/4`);
  console.log(`❌ Tipos con error: ${4 - funcionando.length}/4`);
  
  funcionando.forEach(tipo => {
    console.log(`✅ ${tipo.toUpperCase()}: Creación y generación Flutter OK`);
  });

  tipos.filter(tipo => !results[tipo] || !flutterResults[tipo]).forEach(tipo => {
    console.log(`❌ ${tipo.toUpperCase()}: ${!results[tipo] ? 'Error en creación' : 'Error en generación Flutter'}`);
  });

  if (funcionando.length === 4) {
    console.log('\n🎉 ¡TODOS LOS 4 TIPOS FUNCIONAN CORRECTAMENTE!');
  } else {
    console.log(`\n⚠️  ${funcionando.length} de 4 tipos funcionan. Revisar errores arriba.`);
  }
}

// Ejecutar tests
runAllTests().catch(console.error); 