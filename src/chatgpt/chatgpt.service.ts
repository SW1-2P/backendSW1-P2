import OpenAI from 'openai';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
// import * as xml2js from 'xml2js';

// import { CreateChatgptDto } from './dto/create-chatgpt.dto';
// import { UpdateChatgptDto } from './dto/update-chatgpt.dto';
import { GeneratorService } from '../generator/generator.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatgptService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatgptService.name);

  constructor(private readonly generatorService: GeneratorService) {
    // Obtener la API key desde las variables de entorno
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Para desarrollo, si no hay API key en .env, usar una clave hardcodeada
    // (¡solo para desarrollo! Eliminar en producción)
    const fallbackApiKey = 'sk-test-key123456789'; // Reemplazar con tu API key real para desarrollo
    
    // Usar la API key del entorno o el fallback
    const finalApiKey = apiKey || fallbackApiKey;
    
    if (!finalApiKey) {
      this.logger.error('La API key de OpenAI no está configurada');
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }
    
    this.openai = new OpenAI({
      apiKey: finalApiKey,
    });
    
    this.logger.log('Servicio de ChatGPT inicializado correctamente');
  }

  async generateText(prompt: string, model = 'gpt-3.5-turbo-instruct', maxTokens = 500, temperature = 0.7): Promise<string> {
    try {
      this.logger.debug(`Generando texto con prompt: ${prompt.substring(0, 50)}...`);
      
      const response = await this.openai.completions.create({
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0].text.trim();
    } catch (error) {
      this.logger.error(`Error al llamar a la API de OpenAI: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      throw new InternalServerErrorException('Error al generar texto con OpenAI');
    }
  }

  async chat(messages: Array<{ role: string; content: string }>, model = 'gpt-3.5-turbo', temperature = 0.7): Promise<string> {
    try {
      this.logger.debug(`Generando respuesta de chat con ${messages.length} mensajes`);
      
      // Asegurarse de que los mensajes tengan el formato correcto que espera OpenAI
      const validatedMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: validatedMessages,
        // temperature,
      });

      console.log(response);
      console.log(response.choices[0].message.content);
      
      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Error al llamar a la API de OpenAI: ${error.message}`, error.stack);
      
      if (error.status === 429) {
        throw new InternalServerErrorException('Límite de solicitudes a OpenAI excedido. Intente de nuevo más tarde.');
      }
      
      throw new InternalServerErrorException('Error al generar respuesta de chat con OpenAI');
    }
  }

  /**
   * Genera un proyecto Angular a partir de un XML utilizando OpenAI
   * @param xmlContent Contenido XML a procesar
   * @param specificInstructions Instrucciones adicionales para personalizar la generación
   * @param model Modelo de OpenAI a utilizar
   * @returns Buffer con el archivo ZIP del proyecto generado
   */
  async generateAngularFromXml(
    xmlContent: string, 
    specificInstructions = '', 
    // model = 'gpt-4o-mini'
    // model = 'o4-mini'
    model = 'gpt-4.1'
  ): Promise<Buffer> {
    try {
      this.logger.log('Iniciando generación de Angular con OpenAI');
      
      // Crear prompt para enviar a OpenAI
      const systemPrompt = `You are a specialized Angular code generator. 
Your task is to analyze an XML that defines an Angular application and generate the necessary code to implement it.
You must produce well-structured HTML, TypeScript, and CSS files, following Angular best practices.

Code generation rules:
1. IMPORTANT: Analyze ALL the provided XML, don't omit any part
2. CRUCIAL: Respect EXACTLY the structure and elements defined in the XML
3. DO NOT invent components or elements that are not specified in the XML
4. Implement ONLY what is requested in the XML, without adding extra functionality
5. Generate the complete structure of the Angular project
6. Use components, services, and modules as needed
7. Implement reactive forms for input fields
8. Include navigation and routes if specified in the XML
9. Ensure the code is valid and well-formatted
10. Use CSS for styles (not SCSS)
11. Use properly typed TypeScript
12. DO NOT generate components, modules, or files that are not related to the provided XML
13. IMPORTANT: DO NOT import global styles in component CSS files - each component should have its own independent styles without using @import statements

CRITICAL TYPE SAFETY REQUIREMENTS:
1. When using Array.from(), always add appropriate type annotations to prevent type errors
2. For example, use: Array.from<YourType>(source)
3. When chaining methods like Array.from().filter(), add explicit types:
   // CORRECT:
   // Array.from<YourType>(source).filter((item: YourType) => condition)
   
   // AVOID:
   // Array.from(source).filter(item => condition)
4. Always ensure proper typing for array operations, especially when using map, filter, reduce, etc.
5. Prefer explicit type declarations over type inference when working with collections

CRITICAL ARCHITECTURAL REQUIREMENTS:
1. Use EXCLUSIVELY the standalone architecture of Angular 19+ (NO NgModules)
2. Each component MUST have:
   - Standalone: true property
   - Explicit imports of everything it uses (RouterOutlet, CommonModule, etc.)
3. DO NOT generate main.ts - it will be created automatically by the system
4. Use import { RouterOutlet } from '@angular/router'; in components that use router-outlet
5. Configure services with providedIn: 'root' and use inject() instead of constructor injection

CRITICAL FILE REQUIREMENTS:
1. Create polyfills.ts with EXACT content:
   import 'zone.js';

2. DO NOT create app.config.ts - it will be generated automatically by the system

CRITICAL: Treat the XML as a mockup/wireframe for the application. Each page or screen in the XML should be implemented as a separate Angular component and added to the routing configuration.

CRITICAL XML INTERPRETATION RULES:
1. The XML contains graphical mockup elements like mxCell, mxGraphModel, browser windows, etc. - these are ONLY visual representations, NOT actual components to implement.
2. Elements like <mxCell id="browser-X"> represent PAGES in the application, not actual browser windows to code.
3. DO NOT create components named "browser", "mxCell", "browserWindow", etc.
4. When you see tags like:
   <mxCell id="browser-1" value="" style="...shape=mxgraph.mockup.containers.browserWindow;...">
     <mxGeometry x="50" y="100" width="800" height="600" as="geometry"/>
   </mxCell>
   This represents a PAGE or SCREEN in your application. Create a component for the content INSIDE the browser window, not for the browser window itself.

5. Browser window elements are ONLY VISUAL FRAMES to organize content in the mockup - they indicate different pages/routes in the application.
6. Understand that mxCell, mxGeometry, etc., are purely for the mockup's visual representation and should NOT be implemented as components.
7. IMPORTANT: The dimensions and positions specified in the XML (like x="50" y="100" width="800" height="600") are just for the mockup visualization. Your implementation should be RESPONSIVE and ADAPTABLE to different screen sizes, not fixed to these exact dimensions.

RESPONSIVE DESIGN REQUIREMENTS:
1. Make all pages and components fully responsive using modern CSS techniques
2. DO NOT use the exact pixel dimensions from the XML - implement flexible layouts instead
3. Use responsive units (%, vh, vw, rem) instead of fixed pixel values
4. Implement media queries to adapt layouts for different screen sizes
5. All components should adapt to their container's dimensions
6. Use CSS Flexbox and Grid for creating adaptive layouts

It is CRITICAL that you generate the following ESSENTIAL files for the Angular project to work:
- src/index.html - Main HTML file
- src/styles.css - Global application styles
- src/polyfills.ts - With EXACT content: import 'zone.js';
- src/favicon.ico - Site icon (you can omit this file if it's difficult to generate)
- src/assets/ - Folder for static resources
- src/app/app.component.ts - Root component WITH standalone: true AND RouterOutlet import
- src/app/app.component.html - Root component template (implement the main structure of the XML here)
- src/app/app.component.css - Root component styles
- src/app/app.routes.ts - Route configuration (IMPORTANT: Each page from the XML should have its route here)

EXAMPLE for app.component.ts - Use this format:
import { Component } from '@angular/core';
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

DO NOT generate the following files as they will be provided by the system:
- main.ts - Main entry point (will be generated by the system)
- app.config.ts - Application configuration with providers (will be generated by the system)
- package.json - Project dependencies
- tsconfig.json - TypeScript configuration
- tsconfig.app.json - TypeScript application configuration
- karma.conf.js - Karma configuration
- src/test.ts - Test entry point
- angular.json - Angular workspace configuration

IMPORTANT: Even though you should not generate main.ts and app.config.ts, these files MUST be included in the final project and will be automatically copied from the template.

The src/app/app.routes.ts file MUST follow this base structure:
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // Add routes for each page/screen from the XML here
  { path: '**', redirectTo: '' }
];

RECOMMENDED FOLDER STRUCTURE (ONLY if relevant to implement what the XML describes):
- src/app/
  - shared/ → Reusable components, pipes, directives, interfaces, and common services.
  - pages/ → Create a separate component for each page/screen in the XML
  - components/ → Components that make up the pages

========= MODAL FUNCTIONALITY REQUIREMENTS =========
IMPLEMENT FLOATING MODAL FORMS FOR ALL COMPONENTS (EXCEPT LOGIN):

1. MODAL STRUCTURE:
   - Create a reusable modal component in shared/components/modal
   - Each modal should have a semi-transparent backdrop overlay
   - Include a header with title and close button
   - Provide a content area for forms or information
   - Add footer with action buttons (Save, Cancel, etc.)

2. CRUD OPERATIONS VIA MODALS:
   - CREATE: Implement "Add New" buttons that open modals with empty forms
   - READ: Add "View Details" functionality that opens modals with populated data
   - UPDATE: Create "Edit" buttons that open modals with pre-populated forms
   - DELETE: Add "Delete" buttons that open confirmation modals

3. MODAL IMPLEMENTATION DETAILS:
   - FORM STATE: Use Angular Reactive Forms (@angular/forms)
   - DATA PERSISTENCE: Maintain state in the parent component when modals close
   - VALIDATION: Implement form validation with visual feedback
   - ACCESSIBILITY: Ensure modals are keyboard navigable and follow a11y best practices
   - ANIMATIONS: Add smooth open/close animations (0.3s duration)

4. MODAL STYLING:
   - Maximum width of 500px for form modals
   - Centered on screen with proper z-index
   - Box-shadow for elevation effect
   - Subtle entrance animation (fade in + slight scale or slide)
   - Responsive design that works on mobile devices

5. INTERACTIONS:
   - Close modal when clicking outside (on backdrop)
   - Close with Escape key
   - Focus trap within the modal for keyboard navigation
   - Prevent scrolling of background content when modal is open

6. CREATE/EDIT MODAL STYLES:
   - Add specific styling for create/edit modals with form elements
   - Use consistent padding (24px) around form sections
   - Implement elegant field grouping with 16px spacing between groups
   - Style form labels with 12px font-size and 600 font-weight
   - Add transition effects on input focus (border-color change in 0.2s)
   - Use distinct visual styling for primary action buttons (Save/Create)
   - Implement subtle visual indicators for required fields
   - Add field validation styles with red borders and error messages
   - Include inline help text under complex form fields
   - Maintain consistent button placement (Cancel on left, Save/Create on right)

7. IMPORTANT - MODAL INPUT FUNCTIONALITY:
   - Use 'click' instead of 'mousedown' events on modal-backdrop
   - Add stopPropagation on the modal div to prevent clicks from reaching the backdrop
   - Use e.currentTarget in backdrop click handlers for more precise detection
   - Modify the trapFocus function to only focus the first element once when modal opens
   - Avoid constantly recalling trapFocus which could interfere with inputs
   - Add CSS with 'pointer-events: auto !important' for inputs inside modals
   - Reset previouslyFocused element when modal closes
   - Ensure modal container has higher z-index than backdrop

========= FORM TYPE SAFETY REQUIREMENTS =========
To ensure type safety in Reactive Forms, ALWAYS follow these rules:

1. REACTIVE FORM INITIALIZATION:
   - ALWAYS initialize form controls with compatible types (NOT null)
   - For ID fields, use 0 as initial value (NOT null)
   - Example:
     \`\`\`
     this.form = this.fb.group({
       id: [0], // ALWAYS use 0, not null
       name: ['', [Validators.required]],
       state: ['active']
     });
     \`\`\`

2. FORM RESET PRACTICES:
   - When resetting forms for new entries, explicitly set id to 0:
     \`\`\`
     resetForm(): void {
       this.form.reset({
         id: 0, // IMPORTANT: always reset with 0
         name: '',
         state: 'active'
       });
     }
     \`\`\`

3. TYPE-SAFE DATA EXTRACTION:
   - NEVER cast form.value directly to interface types
   - ALWAYS create explicitly typed objects:
     \`\`\`
     // CORRECT approach
     const newItem: ItemType = {
       id: this.form.value.id as number,
       name: this.form.value.name as string,
       state: this.form.value.state as string
     };
     
     // NEVER DO THIS:
     // const newItem: ItemType = this.form.value as ItemType;
     \`\`\`

4. FORM POPULATION FOR EDITING:
   - When setting form values for editing, use setValue or patchValue:
     \`\`\`
     editItem(item: ItemType): void {
       this.form.patchValue({
         id: item.id,
         name: item.name,
         state: item.state
       });
     }
     \`\`\`

The modals MUST be fully functional - not just visual placeholders.

========= XML ANALYSIS INSTRUCTIONS =========
IMPORTANT: I have detected that you may have difficulties correctly interpreting the XML. Follow these specific instructions:

1. CAREFULLY ANALYZE THE XML - For each element in the XML:
   - If the element describes a UI component, create an Angular component
   - If the element describes a data model, create TypeScript interfaces
   - If the element describes relationships, implement routes or services
   - If the element appears to be a page/screen, create a page component and add it to the routes

2. IF THE XML CONTAINS VISUAL ELEMENTS like mxCell, mxGraphModel, swimlane, etc:
   - These are graphical interface elements that you should implement as visual components in Angular
   - You must recreate EXACTLY the same visual appearance using HTML/CSS
   - For <mxCell> elements with geometry and style attributes, create positioned divs with CSS
   - Nested elements should represent parent-child relationships in the UI
   - Respect exactly colors, sizes, positions, and text specified

3. FOR APPLICATION STRUCTURE ELEMENTS:
   - Identify modules, components, services and create the corresponding structure
   - Implement each element exactly as described
   - If there are <Component>, <Module>, etc. elements, create them according to their definitions

4. ALL XML IS IMPORTANT, don't ignore any section or element

EACH GENERATED FILE MUST INCLUDE:
- Necessary imports
- The declared class or function
- ONLY the implementation of what is specified in the XML

XML ANALYSIS:
1. Identify the main elements (screens, components, etc.)
2. Create Angular components only for the elements identified in the XML
3. Implement the functionalities described in the XML, without inventing others
4. If there is mxGraphModel, mxCell or similar elements, these are visual/graphical elements that you should implement in HTML/CSS

========= PREMIUM CSS STYLING REQUIREMENTS =========
For EVERY component, implement PREMIUM-QUALITY CSS with these characteristics:

1. MODERN LOOK AND FEEL:
   - Use subtle gradients and shadows for depth
   - Implement rounded corners (8-16px) for containers and buttons
   - Use smooth transitions and animations (0.2-0.3s) for hover and active states
   - Create neumorphic or glassmorphic effects where appropriate
   - Implement subtle hover states for all interactive elements

2. PROFESSIONAL COLOR PALETTE:
   - Use a consistent color scheme with 2-3 primary colors and 2-3 accent colors
   - Create a coherent color system with:
     - Primary color: #3366cc (or other suitable color based on XML)
     - Secondary color: #5bbfba (or similar complementary color)
     - Accent colors: #ff6b6b, #ffb75e (for warnings, success states, etc.)
     - Neutral colors: #f8f9fa, #e9ecef, #dee2e6, #ced4da, #6c757d, #343a40
   - Always ensure proper contrast for accessibility (WCAG AA standard minimum)
   - Use color opacity/alpha values for subtle variations

3. TYPOGRAPHY:
   - Use a modern, clean font stack: 'Roboto', 'Open Sans', system-ui, sans-serif
   - Implement proper font sizes in a typographic scale:
     - Headings: h1 (2rem), h2 (1.75rem), h3 (1.5rem), h4 (1.25rem), h5 (1.1rem)
     - Body text: 1rem (16px)
     - Small text: 0.875rem (14px)
   - Set appropriate line heights: 1.5-1.6 for body text, 1.2-1.3 for headings
   - Define proper letter spacing and font weights

4. LAYOUT AND SPACING:
   - Use CSS Grid and Flexbox for responsive layouts
   - Implement consistent spacing with a 4px or 8px grid system
   - Use proper padding inside containers (16px-24px)
   - Apply consistent margins between elements (16px-32px)
   - Ensure proper white space throughout the interface
   - Create responsive designs that work on all screen sizes
   - Use CSS variables for spacing: --space-xs: 4px, --space-sm: 8px, --space-md: 16px, --space-lg: 24px, --space-xl: 32px, etc.

5. COMPONENT-SPECIFIC STYLING:
   - Buttons: Beautiful gradient or solid backgrounds, proper padding (12px 24px), hover effects
   - Forms: Clean inputs with focus states, proper spacing, validation styling
   - Cards: Subtle shadows, proper padding, hover effects if interactive
   - Navigation: Clear, distinct styling with active states
   - Tables: Clean lines, proper padding, zebra striping or row highlighting
   - Lists: Proper indentation, bullet styling, spacing between items

6. ANIMATIONS AND TRANSITIONS:
   - Add subtle hover animations for interactive elements
   - Implement smooth page transitions if applicable
   - Use CSS transitions for state changes (e.g., transition: all 0.3s ease)

7. ADVANCED CSS TECHNIQUES:
   - Use CSS custom properties (variables) for consistent styling
   - Implement media queries for responsive designs
   - Apply CSS Grid for complex layouts
   - Use pseudo-elements (::before, ::after) for decorative elements
   - Implement CSS filters for image effects
   - Use proper z-index stacking for layered elements

All CSS should be clean, well-commented, and optimized for performance.

CRITICAL CSS RULES:
1. NEVER use @import statements in component CSS files
2. DO NOT import global styles like @import '../../styles.css'
3. Each component must have its own independent styles
4. Use CSS variables for shared values, but define them within each component
5. DO NOT rely on styles from parent components

If the XML includes user interfaces described with elements like mxCell, swimlane, etc., these are visual elements 
that you should convert to HTML/CSS components that look EXACTLY the same as defined in the XML.
For example:
- Rectangular elements (<mxCell> with geometry) should be divs with CSS styles
- Text within elements should be implemented as text content in HTML
- Colors, borders, and other visual properties should be translated to CSS
- Relationships or connections between elements can be implemented with CSS positioning

The response format MUST follow this structure:
[FILE: path/to/file]
\`\`\`typescript
// TypeScript file content
\`\`\`

[FILE: path/to/file.html]
\`\`\`html
<!-- HTML file content -->
\`\`\`

[FILE: path/to/file.css]
\`\`\`css
/* CSS file content */
\`\`\`

Continue with all files needed to implement the application.`;

      // Añadir instrucciones específicas si se proporcionan
      const userPrompt = `${specificInstructions ? `Additional instructions: ${specificInstructions}\n\n` : ''}
Here is the XML/schema of the application that I need you to implement:

${xmlContent}

Please generate all the code files needed to implement this fully functional Angular application.
REMEMBER:
1. Analyze ALL the provided XML and generate code that implements EXACTLY what it shows
2. Create all needed Angular component files, services, interfaces, etc.
3. DO NOT generate main.ts, app.config.ts, package.json or tsconfig.json as they will be provided by the system
4. Each page/screen in the XML should be converted to an Angular component with its own route in app.routes.ts
5. Create beautiful CSS with a modern, professional design as specified
6. Pay special attention to any element with attributes like id, name, value, etc.
7. The code must be functional and follow Angular best practices
8. DO NOT invent components or elements that are not in the XML
9. CRITICAL: All components MUST be standalone with proper imports (RouterOutlet, etc.)
10. CRITICAL: For forms, always initialize FormControls with proper types as specified above
11. CRITICAL: When using forms, follow these rules:
    - Import FormsModule in any component using [(ngModel)]
    - Use bracket notation for accessing form controls: form.controls['propertyName'] 
    - Example of correct validation in HTML: 
      <div *ngIf="form.controls['name'].invalid && form.controls['name'].touched">Error</div>
    - NEVER use dot notation like form.controls.name.invalid

Working example for importing FormsModule:
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  // component code
}`;

      // Enviar la solicitud a OpenAI con un modelo más potente y más tokens para procesar XMLs extensos
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      
      // Usar un timeout mayor y mayor número de tokens para proyectos grandes
      const response = await this.chat(messages, model);
      
      // Guardar los mensajes y respuestas para debugging
      const debugPath = path.join(__dirname, '../../tmp/debug');
      await fs.mkdirp(debugPath);
      await fs.writeFile(
        path.join(debugPath, 'last-openai-request.json'), 
        JSON.stringify({ messages, model }, null, 2)
      );
      await fs.writeFile(
        path.join(debugPath, 'last-openai-response.txt'), 
        response
      );
      await fs.writeFile(
        path.join(debugPath, 'xml-content.xml'), 
        xmlContent
      );
      
      // Procesar la respuesta para extraer los archivos generados
      return await this.processGeneratedFiles(response);
    } catch (error) {
      this.logger.error(`Error generando Angular con OpenAI: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error generando proyecto Angular: ${error.message}`);
    }
  }

  /**
   * Procesa la respuesta de OpenAI para extraer los archivos generados y crear un ZIP
   * @param generatedContent Contenido generado por OpenAI
   * @returns Buffer con el archivo ZIP
   */
  private async processGeneratedFiles(generatedContent: string): Promise<Buffer> {
    this.logger.debug('Procesando archivos generados por OpenAI');
    
    // Crear directorio temporal para almacenar los archivos
    const tempDir = path.join(__dirname, '../../tmp/openai-angular-project');
    await fs.remove(tempDir);
    await fs.mkdirp(tempDir);
    
    try {
      // Extraer archivos del formato [FILE: ruta/al/archivo]
      const filePattern = /\[FILE: ([^\]]+)\]\s*```(?:\w+)?\s*([\s\S]*?)```/g;
      let match;
      let fileCount = 0;
      
      // Lista de archivos a excluir (no crear o eliminar si existen)
      const excludedFiles = [
        'src/environment.ts',
        'src/environments/environment.ts',
        'src/environments/environment.prod.ts',
        'tsconfig.app.json',
        'karma.conf.js',
        'src/test.ts',
        'tsconfig.spec.json',
        'package.json',
        'tsconfig.json'
        // angular.json se ha eliminado de esta lista para permitir su inclusión
      ];
      
      // Guardar todo el contenido generado para debugging
      await fs.writeFile(
        path.join(tempDir, '_generated_content.txt'), 
        generatedContent
      );
      
      while ((match = filePattern.exec(generatedContent)) !== null) {
        const filePath = match[1].trim();
        const fileContent = match[2].trim();
        
        // Verificar si el archivo está en la lista de exclusión
        if (excludedFiles.some(excluded => filePath.endsWith(excluded))) {
          this.logger.debug(`Archivo excluido: ${filePath}`);
          continue;
        }
        
        // Crear ruta completa
        const fullPath = path.join(tempDir, filePath);
        
        // Asegurar que el directorio existe
        await fs.mkdirp(path.dirname(fullPath));
        
        // Escribir el archivo
        await fs.writeFile(fullPath, fileContent);
        fileCount++;
        
        this.logger.debug(`Archivo creado: ${filePath}`);
      }
      
      this.logger.log(`Total de archivos creados: ${fileCount}`);
      
      // Si no se encontraron archivos, manejar el error
      if (fileCount === 0) {
        throw new Error('No se pudieron extraer archivos del contenido generado');
      }
      
      // Añadir archivos críticos que podrían faltar
      await this.ensureCriticalAngularFiles(tempDir);
      
      // Generar archivos de configuración con GeneratorService
      this.logger.debug('Generando archivos de configuración con GeneratorService');
      
      // Crear XML básico para el generatorService
      const xmlPath = path.join(tempDir, 'app-structure.xml');
      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<App>
  <Structure>
    <n>openai-angular-project</n>
    <Components>`;
      
      // Analizar los componentes a partir de los archivos generados
      const appDir = path.join(tempDir, 'src/app');
      if (await fs.pathExists(appDir)) {
        try {
          const files = await fs.readdir(appDir);
          for (const file of files) {
            if (file.endsWith('.component.ts')) {
              const componentName = file.replace('.component.ts', '');
              xmlContent += `
        <Component>
          <n>${componentName}</n>
          <Type>component</Type>
        </Component>`;
            }
          }
        } catch (error) {
          this.logger.error('Error al analizar componentes:', error);
        }
      }
      
      xmlContent += `
    </Components>
  </Structure>
</App>`;
      
      await fs.writeFile(xmlPath, xmlContent);
      
      // Crear carpeta temporal para GeneratorService
      const generatorTempDir = path.join(__dirname, '../../tmp/angular-project');
      await fs.remove(generatorTempDir);
      await fs.mkdirp(generatorTempDir);
      
      // Generar proyecto base con GeneratorService
      // Generamos un proyecto completo usando GeneratorService 
      const generatedZipBuffer = await this.generatorService.generateFromXml(xmlContent);
      
      // Extraer el ZIP a un directorio temporal
      const generatedZip = new AdmZip(generatedZipBuffer);
      generatedZip.extractAllTo(generatorTempDir, true);
      
      // Copiar los archivos de configuración necesarios
      const configFiles = [
        { src: path.join(generatorTempDir, 'package.json'), dest: path.join(tempDir, 'package.json') },
        { src: path.join(generatorTempDir, 'package-lock.json'), dest: path.join(tempDir, 'package-lock.json') },
        { src: path.join(generatorTempDir, 'tsconfig.json'), dest: path.join(tempDir, 'tsconfig.json') },
        { src: path.join(generatorTempDir, 'tsconfig.app.json'), dest: path.join(tempDir, 'tsconfig.app.json') },
        { src: path.join(generatorTempDir, 'angular.json'), dest: path.join(tempDir, 'angular.json') }, // Añadido angular.json
        { src: path.join(generatorTempDir, 'src/main.ts'), dest: path.join(tempDir, 'src/main.ts') }, // Incluir main.ts
        { src: path.join(generatorTempDir, 'src/app/app.config.ts'), dest: path.join(tempDir, 'src/app/app.config.ts') } // Incluir app.config.ts
      ];
      
      for (const file of configFiles) {
        if (await fs.pathExists(file.src)) {
          try {
            await fs.copy(file.src, file.dest);
            this.logger.debug(`Archivo de configuración copiado: ${path.basename(file.dest)}`);
          } catch (error) {
            this.logger.error(`Error al copiar ${path.basename(file.src)}: ${error.message}`);
            // Para archivos críticos, lanzar un error
            if (file.dest.includes('main.ts') || file.dest.includes('app.config.ts')) {
              throw new Error(`Error al copiar archivo crítico ${path.basename(file.src)}`);
            }
          }
        } else {
          this.logger.warn(`Archivo de configuración no encontrado: ${path.basename(file.src)}`);
          // Para archivos críticos, lanzar un error
          if (file.dest.includes('main.ts') || file.dest.includes('app.config.ts')) {
            throw new Error(`Archivo crítico no encontrado: ${path.basename(file.src)}`);
          }
        }
      }
      
      // Verificar que los archivos críticos existen
      const criticalFiles = [
        path.join(tempDir, 'src/main.ts'),
        path.join(tempDir, 'src/app/app.config.ts')
      ];
      
      for (const file of criticalFiles) {
        if (await fs.pathExists(file)) {
          this.logger.log(`Archivo crítico verificado: ${path.basename(file)}`);
        } else {
          this.logger.error(`Archivo crítico NO encontrado: ${path.basename(file)}`);
          throw new Error(`Archivo crítico faltante: ${path.basename(file)}`);
        }
      }
      
      // Crear ZIP desde el directorio
      const resultZip = new AdmZip();
      
      // Agregar todos los archivos generados
      const addDirToZip = (dir: string, zipFolderPath = '') => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const zipFilePath = path.join(zipFolderPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            addDirToZip(filePath, zipFilePath);
          } else {
            resultZip.addFile(zipFilePath, fs.readFileSync(filePath));
          }
        });
      };
      
      addDirToZip(tempDir);
      
      // Generar buffer del ZIP
      const finalZipBuffer = resultZip.toBuffer();
      
      // Limpieza de archivos temporales (opcional)
      // await fs.remove(tempDir);
      // await fs.remove(generatorTempDir);
      
      return finalZipBuffer;
    } catch (error) {
      this.logger.error(`Error procesando archivos generados: ${error.message}`, error.stack);
      
      // Limpiar archivos temporales en caso de error
      await fs.remove(tempDir);
      
      throw error;
    }
  }

  /**
   * Garantiza que todos los archivos críticos para Angular estén presentes
   * @param projectDir Directorio del proyecto
   */
  private async ensureCriticalAngularFiles(projectDir: string): Promise<void> {
    const srcPath = path.join(projectDir, 'src');
    const appPath = path.join(srcPath, 'app');
    
    // Asegurar que las carpetas existen
    await fs.mkdirp(srcPath);
    await fs.mkdirp(appPath);
    
    // 1. Verificar y crear polyfills.ts si no existe
    const polyfillsPath = path.join(srcPath, 'polyfills.ts');
    if (!await fs.pathExists(polyfillsPath)) {
      this.logger.debug('Creando polyfills.ts ya que no existe');
      await fs.writeFile(
        polyfillsPath,
        `/**
 * Polyfills for Angular application
 */

// Zone.js is required by Angular
import 'zone.js';
`
      );
    }
    
    // 2. Verificar app.component.ts para asegurar que tiene standalone: true y RouterOutlet
    const appComponentPath = path.join(appPath, 'app.component.ts');
    if (await fs.pathExists(appComponentPath)) {
      let appComponentContent = await fs.readFile(appComponentPath, 'utf8');
      
      // Verificar si contiene standalone: true
      if (!appComponentContent.includes('standalone: true')) {
        this.logger.debug('Corrigiendo app.component.ts para añadir standalone: true');
        
        // Modificar el contenido para añadir standalone
        appComponentContent = appComponentContent.replace(
          /@Component\(\{/,
          '@Component({\n  standalone: true,'
        );
        
        // Verificar si importa RouterOutlet
        if (!appComponentContent.includes('RouterOutlet')) {
          // Si tiene router-outlet en el HTML pero no importa RouterOutlet
          const appComponentHtmlPath = path.join(appPath, 'app.component.html');
          if (await fs.pathExists(appComponentHtmlPath)) {
            const appComponentHtmlContent = await fs.readFile(appComponentHtmlPath, 'utf8');
            
            if (appComponentHtmlContent.includes('router-outlet')) {
              this.logger.debug('Añadiendo importación de RouterOutlet en app.component.ts');
              
              // Añadir importación de RouterOutlet
              appComponentContent = appComponentContent.replace(
                /import { Component } from '@angular\/core';/,
                "import { Component } from '@angular/core';\nimport { RouterOutlet } from '@angular/router';"
              );
              
              // Añadir RouterOutlet a los imports
              appComponentContent = appComponentContent.replace(
                /standalone: true,/,
                'standalone: true,\n  imports: [RouterOutlet],'
              );
            }
          }
        }
        
        // Guardar el archivo modificado
        await fs.writeFile(appComponentPath, appComponentContent);
      }
    }
    
  }
}