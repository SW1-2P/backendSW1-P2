const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const API_URL = 'http://localhost:3000/chatgpt/generate-angular';
const XML_PATH = path.join(__dirname, '../../tmp/test-xml/sample.xml');
const OUTPUT_ZIP = path.join(__dirname, '../../tmp/test-xml/angular-project.zip');

async function testGenerateAngular() {
  try {
    console.log('Leyendo archivo XML:', XML_PATH);
    
    // Verificar que el archivo XML existe
    if (!fs.existsSync(XML_PATH)) {
      console.error('El archivo XML no existe en la ruta especificada.');
      return;
    }
    
    // Leer contenido del XML
    const xmlContent = fs.readFileSync(XML_PATH, 'utf8');
    console.log('Contenido XML cargado:', xmlContent.substring(0, 150) + '...');
    
    // Preparar solicitud
    const requestData = {
      xml: xmlContent,
      specificInstructions: 'Generar aplicación Angular simple basada en este XML.'
    };
    
    console.log('Enviando solicitud a OpenAI para generar Angular...');
    
    // Enviar solicitud al servidor
    const response = await axios.post(API_URL, requestData, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/zip'
      },
    });
    
    console.log('Respuesta recibida. Guardando ZIP...');
    
    // Guardar el archivo ZIP
    fs.writeFileSync(OUTPUT_ZIP, response.data);
    
    console.log('Proyecto Angular generado y guardado en:', OUTPUT_ZIP);
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response) {
      // Si hay datos de respuesta, intentar imprimirlos
      if (error.response.data instanceof Buffer) {
        // Si es un Buffer, convertir a string
        const errorData = error.response.data.toString('utf8');
        try {
          // Intentar parsear como JSON
          const errorJson = JSON.parse(errorData);
          console.error('Error del servidor:', errorJson);
        } catch (e) {
          // Si no se puede parsear, mostrar el texto tal cual
          console.error('Error del servidor (texto plano):', errorData);
        }
      } else {
        console.error('Error del servidor:', error.response.data);
      }
    }
  }
}

// Ejecutar la función
testGenerateAngular(); 