import { GeneratorService } from './generator.service';
import * as fs from 'fs-extra';
import * as path from 'path';

// Script de prueba para verificar la generación de archivos Angular
async function testGenerator() {
  try {
    console.log('Iniciando prueba de generación de proyecto Angular...');
    
    // Crear una instancia del servicio
    const generatorService = new GeneratorService();
    
    // XML de prueba básico
    const testXml = `<App>
      <Interface name="Test">
        <Component name="Test" type="form">
          <Field name="username" type="text" label="Usuario" />
          <Field name="password" type="password" label="Contraseña" />
          <Button label="Iniciar sesión" action="login" />
        </Component>
      </Interface>
    </App>`;
    
    // Directorio para guardar el ZIP generado
    const outputDir = path.join(__dirname, '../../test-output');
    await fs.mkdirp(outputDir);
    
    // Llamar al método que genera el proyecto
    console.log('Generando proyecto desde XML...');
    const zipBuffer = await generatorService.generateFromXml(testXml);
    
    // Guardar el ZIP generado
    const zipPath = path.join(outputDir, 'angular-project-test.zip');
    await fs.writeFile(zipPath, zipBuffer);
    console.log(`ZIP guardado en: ${zipPath}`);
    
    // Extraer el ZIP para verificar su contenido
    console.log('Extrayendo ZIP para verificar contenido...');
    const extractDir = path.join(outputDir, 'extracted');
    await fs.mkdirp(extractDir);
    
    // Usar AdmZip para extraer el contenido
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);
    
    // Listar los archivos extraídos para verificar
    console.log('Listando contenido del proyecto extraído:');
    const listFiles = (dir: string, level = 0) => {
      const indent = ' '.repeat(level * 2);
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          console.log(`${indent}📁 ${file}/`);
          listFiles(filePath, level + 1);
        } else {
          console.log(`${indent}📄 ${file} (${stats.size} bytes)`);
        }
      });
    };
    
    listFiles(extractDir);
    console.log('Prueba completada.');
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testGenerator(); 