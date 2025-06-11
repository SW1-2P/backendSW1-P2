import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseGenerator } from './base-generator';
import { GenerationContext } from '../interfaces/generator.interface';
import { ChatgptService } from '../../chatgpt/chatgpt.service';

@Injectable()
export class AngularGenerator extends BaseGenerator {
  constructor(private readonly chatgptService: ChatgptService) {
    super();
  }

  async generateProject(context: GenerationContext): Promise<Buffer> {
    const tempDir = path.join(process.cwd(), 'temp', `angular-project-${Date.now()}`);
    
    try {
      await fs.ensureDir(tempDir);
      await this.createProjectStructure(tempDir, context);
      
      // Generar código usando IA con contexto mejorado
      const generatedCode = await this.generateWithAI(context);
      await this.processGeneratedCode(tempDir, generatedCode);
      
      return await this.createProjectZip(tempDir);
    } catch (error) {
      this.logger.error('Error generando proyecto Angular:', error);
      throw new InternalServerErrorException('Error generando proyecto Angular');
    } finally {
      await this.cleanupTempDirectory(tempDir);
    }
  }

  async createProjectStructure(projectDir: string, context: GenerationContext): Promise<void> {
    this.logger.debug('Creando estructura básica del proyecto Angular');
    
    const appName = this.generateAppName(context.xml || context.prompt || '');
    
    // Crear estructura de directorios Angular
    const directories = [
      'src/app',
      'src/app/core/services',
      'src/app/core/guards',
      'src/app/core/interceptors',
      'src/app/core/models',
      'src/app/shared/components',
      'src/app/shared/services',
      'src/app/shared/pipes',
      'src/app/shared/directives',
      'src/app/features/auth/components',
      'src/app/features/auth/services',
      'src/app/features/home/components',
      'src/app/features/dashboard/components',
      'src/assets/images',
      'src/assets/icons',
      'src/styles',
      'src/environments',
    ];
    
    for (const dir of directories) {
      await fs.mkdirp(path.join(projectDir, dir));
    }
    
    // Crear archivos base
    await this.createBaseFiles(projectDir, appName, context);
  }

  async processGeneratedCode(projectDir: string, code: string): Promise<void> {
    const filePattern = /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g;
    let match;
    
    while ((match = filePattern.exec(code)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2].trim();
      
      const fullPath = path.join(projectDir, filePath);
      await this.writeFile(fullPath, fileContent);
    }
  }

  private async generateWithAI(context: GenerationContext): Promise<string> {
    const systemPrompt = this.createSystemPrompt();
    const userPrompt = this.createUserPrompt(context);
    
    this.logger.debug('🤖 Generando código Angular con GPT-4o...');
    
    // Usar método especializado para Angular
    return await this.chatgptService.generateAngularCode(systemPrompt, userPrompt);
  }

  private createSystemPrompt(): string {
    return `Eres un experto desarrollador Angular especializado en crear aplicaciones web desde mockups y descripciones.

REQUISITOS CRÍTICOS:
1. Generar AL MENOS 6 componentes/páginas diferentes y funcionales
2. Implementar enrutamiento completo usando Angular Router
3. Usar Angular Material o PrimeNG para componentes UI
4. Implementar arquitectura modular (feature modules)
5. Usar servicios para la lógica de negocio y comunicación HTTP
6. Implementar manejo de estado con RxJS y servicios
7. Incluir validación de formularios reactivos
8. Agregar guards para protección de rutas
9. Usar interceptors para manejo de errores y autenticación
10. Implementar responsive design con CSS Grid/Flexbox
11. Seguir las mejores prácticas de Angular (style guide oficial)

ESTRUCTURA OBLIGATORIA:
- src/main.ts - Bootstrap de la aplicación
- src/app/app.component.ts - Componente raíz
- src/app/app-routing.module.ts - Configuración de rutas
- src/app/app.module.ts - Módulo principal
- src/app/core/ - Servicios singleton y funcionalidad core
- src/app/shared/ - Componentes y servicios compartidos
- src/app/features/[feature]/ - Módulos de funcionalidad específica
- src/environments/ - Configuraciones por ambiente
- src/styles/ - Estilos globales

TECNOLOGÍAS A USAR:
- Angular 17+ con standalone components donde sea apropiado
- Angular Material o PrimeNG
- RxJS para programación reactiva
- Formularios reactivos
- HttpClient para llamadas HTTP
- Angular CDK para utilidades

Genera archivos Angular completos usando [FILE: ruta] como marcadores.
Cada archivo debe ser sintácticamente correcto y listo para ejecutar.`;
  }

  private createUserPrompt(context: GenerationContext): string {
    let prompt = '';
    
    if (context.mockupData) {
      prompt += `Genera una aplicación Angular completa basada en este MOCKUP:\n\n${JSON.stringify(context.mockupData, null, 2)}\n\n`;
    }
    
    if (context.xml) {
      prompt += `XML del diseño:\n${context.xml}\n\n`;
    }
    
    if (context.prompt) {
      prompt += `Descripción adicional:\n"${context.prompt}"\n\n`;
    }

    prompt += `CARACTERÍSTICAS ESPECÍFICAS:
- Nombre de la app: ${context.config?.package_name || 'angular-app'}
- Versión: ${context.config?.version || '1.0.0'}
- Descripción: ${context.config?.description || 'Angular application'}
- Features solicitadas: ${context.config?.features?.join(', ') || 'auth, dashboard, crud'}
- UI Library: ${context.config?.theme === 'primeng' ? 'PrimeNG' : 'Angular Material'}

GENERA UNA APLICACIÓN COMPLETAMENTE FUNCIONAL:
1. Si el mockup/descripción es específica, implementa exactamente eso
2. Si es general, crea una SPA completa con:
   - Login/registro con guards
   - Dashboard con navegación
   - Al menos 3 módulos de funcionalidad (CRUD)
   - Perfil de usuario
3. Incluye enrutamiento lazy loading entre módulos
4. Haz que cada página sea interactiva y funcional
5. Usa datos de ejemplo realistas con servicios mock
6. Implementa formularios con validación completa
7. Agrega elementos visuales atractivos con animaciones
8. Incluye manejo de errores y estados de carga

Genera TODOS los archivos Angular necesarios para ejecutar la aplicación.`;

    return prompt;
  }

  private async createBaseFiles(projectDir: string, appName: string, context: GenerationContext): Promise<void> {
    // package.json
    const packageJsonContent = `{
  "name": "${appName}",
  "version": "${context.config?.version || '1.0.0'}",
  "description": "${context.config?.description || 'Angular application generada automáticamente'}",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/cdk": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/material": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.5.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "@types/jasmine": "~4.3.0",
    "@types/node": "^18.7.0",
    "jasmine-core": "~4.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.2.0"
  }
}`;

    await this.writeFile(path.join(projectDir, 'package.json'), packageJsonContent);

    // angular.json
    const angularJsonContent = `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "${appName}": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/${appName}",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.scss"],
            "scripts": []
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "${appName}:build:production"
            },
            "development": {
              "buildTarget": "${appName}:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}`;

    await this.writeFile(path.join(projectDir, 'angular.json'), angularJsonContent);

    // tsconfig.json
    const tsconfigContent = `{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`;

    await this.writeFile(path.join(projectDir, 'tsconfig.json'), tsconfigContent);

    // src/main.ts
    const mainContent = `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot(routes),
      MatToolbarModule,
      MatButtonModule,
      MatCardModule,
      MatInputModule,
      MatIconModule
    )
  ]
}).catch(err => console.error(err));
`;

    await this.writeFile(path.join(projectDir, 'src/main.ts'), mainContent);

    // src/index.html
    const indexHtmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${appName}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body class="mat-typography">
  <app-root></app-root>
</body>
</html>
`;

    await this.writeFile(path.join(projectDir, 'src/index.html'), indexHtmlContent);

    // src/app/app.component.ts
    const appComponentContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: \`
    <mat-toolbar color="primary">
      <mat-toolbar-row>
        <span>${appName}</span>
        <span class="spacer"></span>
        <button mat-icon-button routerLink="/">
          <mat-icon>home</mat-icon>
        </button>
        <button mat-icon-button routerLink="/dashboard">
          <mat-icon>dashboard</mat-icon>
        </button>
      </mat-toolbar-row>
    </mat-toolbar>
    
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  \`,
  styles: [\`
    .spacer {
      flex: 1 1 auto;
    }
    
    .main-content {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }
  \`]
})
export class AppComponent {
  title = '${appName}';
}
`;

    await this.writeFile(path.join(projectDir, 'src/app/app.component.ts'), appComponentContent);

    // src/app/app.routes.ts
    const routesContent = `import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
`;

    await this.writeFile(path.join(projectDir, 'src/app/app.routes.ts'), routesContent);

    // src/app/features/home/home.component.ts
    const homeComponentContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: \`
    <div class="home-container">
      <mat-card class="welcome-card">
        <mat-card-header>
          <mat-card-title>¡Bienvenido a ${appName}!</mat-card-title>
          <mat-card-subtitle>Aplicación Angular generada automáticamente</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="welcome-content">
            <mat-icon class="large-icon">home</mat-icon>
            <p>Esta aplicación ha sido generada usando inteligencia artificial.</p>
            <p>Explora las diferentes secciones usando el menú superior.</p>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Ir al Dashboard
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  \`,
  styles: [\`
    .home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .welcome-card {
      max-width: 500px;
      margin: 20px;
    }
    
    .welcome-content {
      text-align: center;
      padding: 20px 0;
    }
    
    .large-icon {
      font-size: 72px;
      height: 72px;
      width: 72px;
      color: #1976d2;
    }
  \`]
})
export class HomeComponent {
}
`;

    await this.writeFile(path.join(projectDir, 'src/app/features/home/home.component.ts'), homeComponentContent);

    // src/app/features/dashboard/dashboard.component.ts
    const dashboardComponentContent = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: \`
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <mat-grid-list cols="2" rowHeight="200px" gutterSize="16px">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>analytics</mat-icon>
              <mat-card-title>Análisis</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Visualiza métricas y estadísticas importantes.</p>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>people</mat-icon>
              <mat-card-title>Usuarios</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gestiona usuarios y permisos del sistema.</p>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>settings</mat-icon>
              <mat-card-title>Configuración</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Ajusta la configuración de la aplicación.</p>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
        
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>notifications</mat-icon>
              <mat-card-title>Notificaciones</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Administra notificaciones y alertas.</p>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  \`,
  styles: [\`
    .dashboard-container {
      padding: 20px;
    }
    
    .dashboard-card {
      height: 100%;
      width: 100%;
    }
    
    h1 {
      margin-bottom: 20px;
      color: #1976d2;
    }
  \`]
})
export class DashboardComponent {
}
`;

    await this.writeFile(path.join(projectDir, 'src/app/features/dashboard/dashboard.component.ts'), dashboardComponentContent);

    // src/styles.scss
    const stylesContent = `@import '~@angular/material/theming';

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }

// Custom theme
$custom-primary: mat-palette($mat-blue);
$custom-accent: mat-palette($mat-amber);
$custom-warn: mat-palette($mat-red);

$custom-theme: mat-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  )
));

@include mat-core();
@include mat-all-component-themes($custom-theme);

// Global styles
.mat-mdc-card {
  margin-bottom: 16px;
}

.text-center {
  text-align: center;
}

.full-width {
  width: 100%;
}
`;

    await this.writeFile(path.join(projectDir, 'src/styles.scss'), stylesContent);

    // environments
    const environmentContent = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
`;

    await this.writeFile(path.join(projectDir, 'src/environments/environment.ts'), environmentContent);

    const environmentProdContent = `export const environment = {
  production: true,
  apiUrl: 'https://your-api-url.com/api'
};
`;

    await this.writeFile(path.join(projectDir, 'src/environments/environment.prod.ts'), environmentProdContent);
  }
} 