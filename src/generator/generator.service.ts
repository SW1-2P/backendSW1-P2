import { Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as xml2js from 'xml2js';

@Injectable()
export class GeneratorService {
  constructor() {}

  async generateFromXml(xml: string): Promise<Buffer> {
    try {
      // 1. Convertir XML a JSON
      const parser = new xml2js.Parser({ 
        explicitArray: false,
        mergeAttrs: false
      });

      // Validar que xml no sea undefined antes de procesarlo
      if (!xml) {
        throw new Error('No se proporcionó contenido XML');
      }

      const json = await parser.parseStringPromise(xml);

      // 2. Crear carpeta temporal
      const projectDir = path.join(__dirname, '../../tmp/angular-project');
      await fs.remove(projectDir);
      await fs.mkdirp(projectDir);
      console.log(`Directorio del proyecto: ${projectDir}`);

      // 3. Generar proyecto base Angular
      await this.createAngularProject(projectDir);

      // 3.1 Personalizar el proyecto según el JSON
      await this.customizeProject(projectDir, json);

      // 3.2 Generar archivos necesarios de Angular
      await this.createAngularRootFiles(projectDir);

      // 3.3 Guardar una copia del directorio antes de comprimirlo (para debug)
      const backupDir = path.join(__dirname, '../../tmp/angular-project-backup');
      try {
        await fs.remove(backupDir);
        await fs.copy(projectDir, backupDir);
        console.log(`Se creó una copia de respaldo en: ${backupDir}`);
      } catch (error) {
        console.error('Error al crear respaldo:', error);
      }

      // 4. Empaquetar en zip
      const zipPath = await this.createZip(projectDir);

      // 5. Leer el zip y retornarlo
      const zipBuffer = await fs.readFile(zipPath);

      // 6. Limpiar el temporal
      // Mantenemos el directorio de respaldo para poder inspeccionarlo si hay problemas
      await fs.remove(projectDir);

      return zipBuffer;
    } catch (error) {
      console.error('Error en generateFromXml:', error);
      throw new Error(`Error al generar proyecto desde XML: ${error.message}`);
    }
  }

  async createZip(projectDir: string): Promise<string> {
    const zip = new AdmZip();
    const zipPath = `${projectDir}.zip`;

    console.log(`Empaquetando proyecto desde: ${projectDir}`);
    
    try {
      // Verificar que los archivos esenciales existan antes de empaquetar
      this.verifyRequiredFiles(projectDir);

    const addDirToZip = (dir: string, zipFolderPath = '') => {
        try {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const zipFilePath = path.join(zipFolderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
              // Si es un directorio, asegurarnos de que se incluye
              zip.addFile(`${zipFilePath}/`, Buffer.from(''));
          addDirToZip(filePath, zipFilePath);
        } else {
              try {
                const content = fs.readFileSync(filePath);
                zip.addFile(zipFilePath, content);
              } catch (error) {
                console.error(`Error al leer el archivo ${filePath}:`, error);
              }
            }
          });
        } catch (error) {
          console.error(`Error al leer el directorio ${dir}:`, error);
        }
    };

    addDirToZip(projectDir);
    zip.writeZip(zipPath);
      console.log(`ZIP creado en: ${zipPath}`);
    } catch (error) {
      console.error('Error al crear ZIP:', error);
      throw new Error('Failed to create ZIP: ' + error.message);
    }

    return zipPath;
  }

  private createAngularProject(projectDir: string) {
    try {
      console.log('Creando proyecto Angular manualmente...');

      // En lugar de usar el CLI, vamos a crear la estructura básica manualmente
      fs.mkdirpSync(projectDir);

      // Crear estructura de directorios básica
      const srcPath = path.join(projectDir, 'src');
      const appPath = path.join(srcPath, 'app');
      fs.mkdirpSync(srcPath);
      fs.mkdirpSync(appPath);
      fs.mkdirpSync(path.join(srcPath, 'assets'));

      // Crear package.json
      this.createDefaultPackageJson(projectDir);

      // Crear angular.json
      this.createDefaultAngularJson(projectDir);

      // Crear tsconfig.json
      this.createDefaultTsConfig(projectDir);

      // Crear index.html
      this.createDefaultIndexHtml(srcPath);

      // Crear main.ts
      this.createDefaultMainTs(srcPath);

      // Crear archivos iniciales básicos
      this.createBasicAppComponent(appPath);

      console.log('Proyecto Angular creado exitosamente de forma manual');
      return true;
    } catch (error) {
      console.error('Error al crear proyecto Angular manualmente:', error);
      throw new Error('Failed to create Angular project: ' + error.message);
    }
  }

  private createDefaultTsConfig(projectDir: string) {
    // Crear tsconfig.json
    const tsConfigPath = path.join(projectDir, 'tsconfig.json');
    const tsConfig = {
      compileOnSave: false,
      compilerOptions: {
        baseUrl: "./",
        outDir: "./dist/out-tsc",
        forceConsistentCasingInFileNames: true,
        strict: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        sourceMap: true,
        declaration: false,
        downlevelIteration: true,
        experimentalDecorators: true,
        moduleResolution: "node",
        importHelpers: true,
        target: "es2020",
        module: "es2020",
        lib: [
          "es2020",
          "dom"
        ]
      },
      angularCompilerOptions: {
        enableI18nLegacyMessageIdFormat: false,
        strictInjectionParameters: true,
        strictInputAccessModifiers: true,
        strictTemplates: true
      }
    };
    fs.writeJsonSync(tsConfigPath, tsConfig, { spaces: 2 });
    
    // Crear tsconfig.app.json
    const tsConfigAppPath = path.join(projectDir, 'tsconfig.app.json');
    const tsConfigApp = {
      extends: "./tsconfig.json",
      compilerOptions: {
        outDir: "./out-tsc/app",
        types: []
      },
      files: [
        "src/main.ts",
        "src/polyfills.ts"
      ],
      include: [
        "src/**/*.d.ts"
      ]
    };
    fs.writeJsonSync(tsConfigAppPath, tsConfigApp, { spaces: 2 });
  }
  
  private createDefaultIndexHtml(srcPath: string) {
    const indexHtmlPath = path.join(srcPath, 'index.html');
    const indexHtmlContent = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Aplicación Angular</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>`;
    fs.writeFileSync(indexHtmlPath, indexHtmlContent);
  }
  
  private createDefaultMainTs(srcPath: string) {
    const mainTsPath = path.join(srcPath, 'main.ts');
    const mainTsContent = `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
`;
    fs.writeFileSync(mainTsPath, mainTsContent);
    
    // Crear polyfills.ts - Asegurar que existe este archivo
    const polyfillsPath = path.join(srcPath, 'polyfills.ts');
    const polyfillsContent = `/**
 * Polyfills for Angular application
 */

// Zone.js is required by Angular
import 'zone.js';

// Other polyfills can be imported here if needed
`;
    fs.writeFileSync(polyfillsPath, polyfillsContent);
    
    // Crear styles.css global
    const stylesCssPath = path.join(srcPath, 'styles.css');
    const stylesCssContent = `/* You can add global styles to this file, and also import other style files */
html, body {
  height: 100%;
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}`;
    fs.writeFileSync(stylesCssPath, stylesCssContent);
  }
  
  private createBasicAppComponent(appPath: string) {
    // Crear app.component.ts con arquitectura standalone
    fs.writeFileSync(
      path.join(appPath, 'app.component.ts'),
      `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-project';
}
`
    );
    
    // Crear app.component.html
    fs.writeFileSync(
      path.join(appPath, 'app.component.html'),
      `<div style="text-align:center">
  <h1>{{ title }}</h1>
  <router-outlet></router-outlet>
</div>
`
    );
    
    // Crear app.component.css
    fs.writeFileSync(
      path.join(appPath, 'app.component.css'),
      `h1 {
  color: #3f51b5;
  font-family: Arial, Helvetica, sans-serif;
}
`
    );
    
    // Crear app.routes.ts
    fs.writeFileSync(
      path.join(appPath, 'app.routes.ts'),
      `import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'modulo-ejemplo', loadChildren: () => import('./modulos/modulo-ejemplo/modulo-ejemplo.routes').then(m => m.MODULO_EJEMPLO_ROUTES) },
  { path: '**', redirectTo: '' }
];
`
    );
    
    // Crear app.config.ts
    fs.writeFileSync(
      path.join(appPath, 'app.config.ts'),
      `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
`
    );
  }
  
  private async createDefaultPackageJson(projectDir: string) {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = {
      name: "test",
      version: "0.0.0", 
      scripts: {
        "ng": "ng",
        "start": "ng serve",
        "build": "ng build",
        "watch": "ng build --watch --configuration development",
        "test": "ng test"
      },
      private: true,
      dependencies: {
        "@angular/common": "^19.2.0",
        "@angular/compiler": "^19.2.0", 
        "@angular/core": "^19.2.0",
        "@angular/forms": "^19.2.0",
        "@angular/platform-browser": "^19.2.0",
        "@angular/platform-browser-dynamic": "^19.2.0",
        "@angular/router": "^19.2.0",
        "rxjs": "~7.8.0",
        "tslib": "^2.3.0",
        "zone.js": "~0.15.0"
      },
      devDependencies: {
        "@angular-devkit/build-angular": "^19.2.9",
        "@angular/cli": "^19.2.9",
        "@angular/compiler-cli": "^19.2.0",
        "@types/jasmine": "~5.1.0",
        "jasmine-core": "~5.6.0",
        "karma": "~6.4.0",
        "karma-chrome-launcher": "~3.2.0",
        "karma-coverage": "~2.2.0",
        "karma-jasmine": "~5.1.0",
        "karma-jasmine-html-reporter": "~2.1.0",
        "typescript": "~5.7.2"
      }
    };
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    
    // Crear un package-lock.json mínimo
    const packageLockPath = path.join(projectDir, 'package-lock.json');
    await fs.writeJson(packageLockPath, {
      name: "test",
      version: "0.0.0",
      lockfileVersion: 3
    }, { spaces: 2 });
  }
  
  private async createDefaultAngularJson(projectDir: string) {
    const angularJsonPath = path.join(projectDir, 'angular.json');
    
    const defaultAngularJson = {
      "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
      "version": 1,
      "newProjectRoot": "projects",
      "projects": {
        "test": {
          "projectType": "application",
          "schematics": {},
          "root": "",
          "sourceRoot": "src",
          "prefix": "app",
          "architect": {
            "build": {
              "builder": "@angular-devkit/build-angular:application",
              "options": {
                "outputPath": "dist/test",
                "index": "src/index.html",
                "browser": "src/main.ts",
                "polyfills": ["src/polyfills.ts"],
                "tsConfig": "tsconfig.app.json",
                "assets": [
                  "src/favicon.ico",
                  "src/assets"
                ],
                "styles": [
                  "src/styles.css"
                ],
                "scripts": []
              },
              "configurations": {
                "production": {
                  "budgets": [
                    {
                      "type": "initial",
                      "maximumWarning": "500kB",
                      "maximumError": "1MB"
                    },
                    {
                      "type": "anyComponentStyle",
                      "maximumWarning": "4kB",
                      "maximumError": "8kB"
                    }
                  ],
                  "outputHashing": "all"
                },
                "development": {
                  "optimization": false,
                  "extractLicenses": false,
                  "sourceMap": true
                }
              },
              "defaultConfiguration": "production"
            },
            "serve": {
              "builder": "@angular-devkit/build-angular:dev-server",
              "configurations": {
                "production": {
                  "buildTarget": "test:build:production"
                },
                "development": {
                  "buildTarget": "test:build:development"
                }
              },
              "defaultConfiguration": "development"
            },
            "extract-i18n": {
              "builder": "@angular-devkit/build-angular:extract-i18n",
              "options": {
                "buildTarget": "test:build"
              }
            },
            "test": {
              "builder": "@angular-devkit/build-angular:karma",
              "options": {
                "polyfills": ["src/polyfills.ts"],
                "tsConfig": "tsconfig.spec.json",
                "assets": [
                  "src/favicon.ico",
                  "src/assets"
                ],
                "styles": [
                  "src/styles.css"
                ],
                "scripts": []
              }
            }
          }
        }
      }
    };
    
    await fs.writeJson(angularJsonPath, defaultAngularJson, { spaces: 2 });
  }

  private async customizeProject(projectDir: string, json: any) {
    const srcPath = path.join(projectDir, 'src');
    const appPath = path.join(srcPath, 'app');
    
    // Crear estructura de carpetas personalizadas
    await this.createCustomStructure(appPath);
    
    // Modificar archivos según el JSON recibido
    await this.updateProjectFiles(projectDir, appPath, json);
  }

  private async createCustomStructure(appPath: string) {
    // Core structure
    const corePath = path.join(appPath, 'core');
    await fs.mkdirp(path.join(corePath, 'services'));
    await fs.mkdirp(path.join(corePath, 'guards'));
    await fs.mkdirp(path.join(corePath, 'interceptors'));
    await fs.mkdirp(path.join(corePath, 'constants'));
    
    // Shared structure
    const sharedPath = path.join(appPath, 'shared');
    const sharedComponentsPath = path.join(sharedPath, 'components');
    await fs.mkdirp(sharedComponentsPath);
    await fs.mkdirp(path.join(sharedPath, 'pipes'));
    await fs.mkdirp(path.join(sharedPath, 'directives'));
    await fs.mkdirp(path.join(sharedPath, 'interfaces'));
    await fs.mkdirp(path.join(sharedPath, 'services'));
    
    // Modules structure
    const modulosPath = path.join(appPath, 'modulos');
    await fs.mkdirp(modulosPath);
  }

  private async updateProjectFiles(projectDir: string, appPath: string, json: any) {
    // Actualizar angular.json para incluir nuestra estructura
    await this.updateAngularJson(projectDir);

    // Crear módulo de ejemplo
    await this.createExampleModule(path.join(appPath, 'modulos'));
    
    // Crear componente Home
    await this.createHomeComponent(path.join(appPath, 'shared/components'));
  }
  
  private async updateAngularJson(projectDir: string) {
    const angularJsonPath = path.join(projectDir, 'angular.json');
    
    if (await fs.pathExists(angularJsonPath)) {
      try {
    const angularJson = await fs.readJson(angularJsonPath);
    
        // Asegurarnos de que el proyecto existe
        const projectName = Object.keys(angularJson.projects)[0] || 'angular-project';
        
        // Verificar y actualizar la configuración del proyecto
        if (angularJson.projects[projectName]) {
          // Actualizar assets
          if (angularJson.projects[projectName].architect?.build?.options) {
            const buildOptions = angularJson.projects[projectName].architect.build.options;
            
            // Verificar si ya existen los assets
            if (!buildOptions.assets) {
              buildOptions.assets = [];
            }
            
            // Asegurarnos de que los assets incluyen src/assets y favicon.ico
            const hasAssets = buildOptions.assets.some(asset => 
              (typeof asset === 'string' && asset === 'src/assets') || 
              (typeof asset === 'object' && asset.glob === '**/*' && asset.input === 'src/assets')
            );
            
            const hasFavicon = buildOptions.assets.some(asset => 
              (typeof asset === 'string' && asset === 'src/favicon.ico') || 
              (typeof asset === 'object' && asset.glob === 'favicon.ico' && asset.input === 'src')
            );
            
            if (!hasAssets) {
              buildOptions.assets.push('src/assets');
            }
            
            if (!hasFavicon) {
              buildOptions.assets.push('src/favicon.ico');
            }
            
            // Verificar si hay estilos
            if (!buildOptions.styles) {
              buildOptions.styles = ['src/styles.css'];
            }
            
            // Verificar si hay scripts
            if (!buildOptions.scripts) {
              buildOptions.scripts = [];
            }
          }
          
          // Si no existe la configuración de test, la agregamos
          if (!angularJson.projects[projectName].architect.test) {
            angularJson.projects[projectName].architect.test = {
              builder: '@angular-devkit/build-angular:karma',
              options: {
                main: 'src/test.ts',
                polyfills: 'src/polyfills.ts',
                tsConfig: 'tsconfig.spec.json',
                karmaConfig: 'karma.conf.js',
                assets: [
                  'src/favicon.ico',
                  'src/assets'
                ],
                styles: [
                  'src/styles.css'
                ],
                scripts: []
              }
            };
          }
          
          // Si no existe la configuración de serve, la agregamos
          if (!angularJson.projects[projectName].architect.serve) {
            angularJson.projects[projectName].architect.serve = {
              builder: '@angular-devkit/build-angular:dev-server',
              options: {
                browserTarget: `${projectName}:build`
              },
              configurations: {
                production: {
                  browserTarget: `${projectName}:build:production`
                },
                development: {
                  browserTarget: `${projectName}:build:development`
                }
              },
              defaultConfiguration: 'development'
            };
          }
        }
        
        await fs.writeJson(angularJsonPath, angularJson, { spaces: 2 });
      } catch (error) {
        console.error('Error al actualizar angular.json:', error);
        
        // Si hay error, reemplazamos con un archivo nuevo
        await this.createDefaultAngularJson(projectDir);
      }
    } else {
      // Si no existe, creamos uno nuevo
      await this.createDefaultAngularJson(projectDir);
    }
  }
 
  private async createExampleModule(modulosPath: string) {
    const moduloEjemploPath = path.join(modulosPath, 'modulo-ejemplo');
    const pagesPath = path.join(moduloEjemploPath, 'pages');
    await fs.mkdirp(pagesPath);
    
    const ejemploPagePath = path.join(pagesPath, 'ejemplo-page');
    await fs.mkdirp(ejemploPagePath);
    
    await fs.mkdirp(path.join(moduloEjemploPath, 'components'));
    await fs.mkdirp(path.join(moduloEjemploPath, 'services'));
    await fs.mkdirp(path.join(moduloEjemploPath, 'models'));
    
    // Componente de página standalone
    await fs.writeFile(
      path.join(ejemploPagePath, 'ejemplo-page.component.ts'),
      `import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EjemploService } from '../../services/ejemplo.service';
import { Ejemplo } from '../../models/ejemplo.model';

@Component({
  selector: 'app-ejemplo-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ejemplo-page.component.html',
  styleUrls: ['./ejemplo-page.component.css']
})
export class EjemploPageComponent implements OnInit {
  title = 'Módulo de Ejemplo';
  items: Ejemplo[] = [];
  
  private ejemploService = inject(EjemploService);
  
  ngOnInit() {
    this.ejemploService.getAll().subscribe(data => {
      this.items = data;
    });
  }
}
      `
    );
    
    await fs.writeFile(
      path.join(ejemploPagePath, 'ejemplo-page.component.html'),
      `
<div class="page-container">
  <h1>{{ title }}</h1>
  <p>Esta es una página de ejemplo para demostrar la estructura del módulo</p>
  
  <div class="items-container">
    <div class="item-card" *ngFor="let item of items">
      <h3>{{ item.nombre }}</h3>
      <p>{{ item.descripcion }}</p>
      <button class="btn-primary">Ver Detalles</button>
    </div>
  </div>
  
  <div class="actions">
    <a routerLink="/" class="btn-secondary">Volver al Inicio</a>
  </div>
</div>
      `
    );
    
    await fs.writeFile(
      path.join(ejemploPagePath, 'ejemplo-page.component.css'),
      `
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-container h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-container p {
  color: #666;
  margin-bottom: 20px;
}

.items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.item-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.item-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.item-card p {
  margin-bottom: 15px;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #3a80d2;
}

.actions {
  margin-top: 20px;
}

.btn-secondary {
  display: inline-block;
  padding: 10px 20px;
  background-color: #95a5a6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
      `
    );
    
    // Crear routes.ts para lazy loading en lugar de módulo
    await fs.writeFile(
      path.join(moduloEjemploPath, 'modulo-ejemplo.routes.ts'),
      `import { Routes } from '@angular/router';
import { EjemploPageComponent } from './pages/ejemplo-page/ejemplo-page.component';

export const MODULO_EJEMPLO_ROUTES: Routes = [
  { path: '', component: EjemploPageComponent }
];
      `
    );
    
    // Añadir el modelo
    await fs.writeFile(
      path.join(moduloEjemploPath, 'models', 'ejemplo.model.ts'),
      `export interface Ejemplo {
  id: number;
  nombre: string;
  descripcion: string;
}
      `
    );
    
    // Servicio con providedIn para inyección automática
    await fs.writeFile(
      path.join(moduloEjemploPath, 'services', 'ejemplo.service.ts'),
      `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Ejemplo } from '../models/ejemplo.model';

@Injectable({
  providedIn: 'root'
})
export class EjemploService {
  private ejemplos: Ejemplo[] = [
    { id: 1, nombre: 'Elemento 1', descripcion: 'Descripción del elemento 1' },
    { id: 2, nombre: 'Elemento 2', descripcion: 'Descripción del elemento 2' },
    { id: 3, nombre: 'Elemento 3', descripcion: 'Descripción del elemento 3' }
  ];

  constructor(private http: HttpClient) { }

  getAll(): Observable<Ejemplo[]> {
    return of(this.ejemplos);
  }

  getById(id: number): Observable<Ejemplo | undefined> {
    const ejemplo = this.ejemplos.find(e => e.id === id);
    return of(ejemplo);
  }
}
      `
    );
  }

  private async createHomeComponent(sharedComponentsPath: string) {
    const homePath = path.join(sharedComponentsPath, 'home');
    await fs.mkdirp(homePath);
    
    await fs.writeFile(
      path.join(homePath, 'home.component.ts'),
      `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  title = 'Bienvenido a la Aplicación Generada';
}
      `
    );
    
    await fs.writeFile(
      path.join(homePath, 'home.component.html'),
      `
<div class="home-container">
  <div class="header">
    <h1>{{ title }}</h1>
    <p>Esta aplicación fue generada automáticamente basada en una estructura XML</p>
  </div>
  
  <div class="content">
    <div class="card">
      <h2>Características</h2>
      <ul>
        <li>Estructura de carpetas optimizada</li>
        <li>Componentes standalone</li>
        <li>Lazy loading de rutas</li>
        <li>Diseño responsive</li>
      </ul>
    </div>
    
    <div class="navigation">
      <h2>Navegación</h2>
      <div class="button-group">
        <a routerLink="/modulo-ejemplo" class="btn">Módulo Ejemplo</a>
      </div>
    </div>
  </div>
</div>
      `
    );
    
    await fs.writeFile(
      path.join(homePath, 'home.component.css'),
      `
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.header p {
  color: #666;
  font-size: 1.2rem;
}

.content {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card, .navigation {
  flex: 1;
  min-width: 300px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h2, .navigation h2 {
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
  color: #555;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
}

.btn:hover {
  background-color: #3a80d2;
}
      `
    );
  }

  private async createAngularRootFiles(projectDir: string) {
    const srcPath = path.join(projectDir, 'src');
    await fs.mkdirp(srcPath);
    
    const appPath = path.join(srcPath, 'app');
    await fs.mkdirp(appPath);
    
    console.log('Creando archivos raíz de Angular...');
    console.log(`Directorio src: ${srcPath}`);
    console.log(`Directorio app: ${appPath}`);
    
    // Los archivos principales ya se han creado en createAngularProject
    // Asegurar que la estructura de carpetas esté completa
    await this.ensureDirectoryStructure(projectDir);
    
    // Verificar que los archivos críticos existan
    this.verifyRequiredFiles(projectDir);
    
    // Asegurar que las extensiones de archivos de estilos sean .css en lugar de .scss
    await this.fixStyleExtensions(projectDir);
  }
  
  private verifyRequiredFiles(projectDir: string) {
    console.log('Verificando archivos críticos...');
    
    const srcPath = path.join(projectDir, 'src');
    const appPath = path.join(srcPath, 'app');
    
    const requiredFiles = [
      { path: path.join(srcPath, 'main.ts'), name: 'main.ts' },
      { path: path.join(srcPath, 'index.html'), name: 'index.html' },
      { path: path.join(appPath, 'app.module.ts'), name: 'app.module.ts' },
      { path: path.join(appPath, 'app.component.ts'), name: 'app.component.ts' },
      { path: path.join(projectDir, 'angular.json'), name: 'angular.json' },
      { path: path.join(projectDir, 'tsconfig.json'), name: 'tsconfig.json' },
      { path: path.join(projectDir, 'package.json'), name: 'package.json' }
    ];
    
    const missingFiles: string[] = [];
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file.path)) {
        console.log(`✅ ${file.name} existe`);
      } else {
        console.log(`❌ ${file.name} NO existe`);
        missingFiles.push(file.name);
      }
    });
    
    if (missingFiles.length > 0) {
      console.error('Faltan archivos críticos:', missingFiles.join(', '));
    }
  }
  
  private async ensureDirectoryStructure(projectDir: string) {
    const srcPath = path.join(projectDir, 'src');
    const appPath = path.join(srcPath, 'app');
    
    // Crear estructura de carpetas en src si no existen
    const envPath = path.join(srcPath, 'environments');
    await fs.mkdirp(envPath);
    
    // Crear archivos de entorno
    await fs.writeFile(
      path.join(envPath, 'environment.ts'),
      `
export const environment = {
  production: false
};
      `
    );
    
    await fs.writeFile(
      path.join(envPath, 'environment.prod.ts'),
      `
export const environment = {
  production: true
};
      `
    );
    
    // Crear archivo de polyfills si es necesario
    const polyfillsPath = path.join(srcPath, 'polyfills.ts');
    if (!await fs.pathExists(polyfillsPath)) {
      await fs.writeFile(
        polyfillsPath,
        `/**
 * Este archivo incluye polyfills necesarios para Angular y se carga antes de la aplicación.
 * Puedes agregar tus propios polyfills adicionales a este archivo.
 */

import 'zone.js';  // Incluido con Angular CLI.
`
      );
    }
    
    // Si se usa Karma para pruebas, crear archivos de configuración
    const karmaConfPath = path.join(projectDir, 'karma.conf.js');
    if (!await fs.pathExists(karmaConfPath)) {
      await fs.writeFile(
        karmaConfPath,
        `// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with \`random: false\`
        // or set a specific seed with \`seed: 4321\`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/angular-project'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
`
      );
    }
    
    // Crear tsconfig.spec.json si no existe
    const tsconfigSpecPath = path.join(projectDir, 'tsconfig.spec.json');
    if (!await fs.pathExists(tsconfigSpecPath)) {
      const tsconfigSpec = {
        extends: "./tsconfig.json",
        compilerOptions: {
          outDir: "./out-tsc/spec",
          types: [
            "jasmine"
          ]
        },
        files: [
          "src/test.ts",
          "src/polyfills.ts"
        ],
        include: [
          "src/**/*.spec.ts",
          "src/**/*.d.ts"
        ]
      };
      await fs.writeJson(tsconfigSpecPath, tsconfigSpec, { spaces: 2 });
    }
    
    // Crear test.ts si no existe
    const testTsPath = path.join(srcPath, 'test.ts');
    if (!await fs.pathExists(testTsPath)) {
      await fs.writeFile(
        testTsPath,
        `// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
`
      );
    }
  }
  
  private async fixStyleExtensions(projectDir: string) {
    console.log('Verificando extensiones de archivos de estilo...');
    
    // Buscar archivos .scss y convertirlos a .css si es necesario
    const findScssFiles = (dir: string) => {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            findScssFiles(filePath);
          } else if (file.endsWith('.scss')) {
            // Reemplazar la extensión .scss por .css
            const newPath = filePath.replace('.scss', '.css');
            console.log(`Convirtiendo ${filePath} a ${newPath}`);
            
            // Leer el contenido del archivo .scss
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Escribir el mismo contenido en un archivo .css
            fs.writeFileSync(newPath, content);
            
            // Eliminar el archivo .scss original
            fs.removeSync(filePath);
            
            // Actualizar las referencias en el archivo .ts correspondiente
            const tsFile = filePath.replace('.scss', '.ts');
            if (fs.existsSync(tsFile)) {
              let tsContent = fs.readFileSync(tsFile, 'utf8');
              tsContent = tsContent.replace('.scss', '.css');
              fs.writeFileSync(tsFile, tsContent);
            }
          }
        }
      } catch (error) {
        console.error(`Error al buscar archivos .scss en ${dir}:`, error);
      }
    };
    
    findScssFiles(projectDir);
    
    // Verificar también el archivo angular.json
    try {
      const angularJsonPath = path.join(projectDir, 'angular.json');
      if (fs.existsSync(angularJsonPath)) {
        const angularJson = fs.readJsonSync(angularJsonPath);
        
        for (const projectName in angularJson.projects) {
          const project = angularJson.projects[projectName];
          
          if (project.architect?.build?.options?.styles) {
            const styles = project.architect.build.options.styles;
            for (let i = 0; i < styles.length; i++) {
              if (typeof styles[i] === 'string' && styles[i].endsWith('.scss')) {
                styles[i] = styles[i].replace('.scss', '.css');
              }
            }
          }
        }
        
        fs.writeJsonSync(angularJsonPath, angularJson, { spaces: 2 });
      }
    } catch (error) {
      console.error('Error al actualizar angular.json:', error);
    }
  }
}