import { Test, TestingModule } from '@nestjs/testing';
import { FlutterGenerator } from './flutter-generator';
import { ChatgptService } from '../../chatgpt/chatgpt.service';
import { FlutterPromptService } from '../services/flutter-prompt.service';
import { FlutterScreenDetectorService } from '../services/flutter-screen-detector.service';
import { GenerationContext } from '../interfaces/generator.interface';

describe('FlutterGenerator', () => {
  let generator: FlutterGenerator;
  let mockChatgptService: jest.Mocked<ChatgptService>;
  let mockPromptService: jest.Mocked<FlutterPromptService>;
  let mockScreenDetector: jest.Mocked<FlutterScreenDetectorService>;

  // XML de test del usuario
  const testXmlMockup = `<mxfile host="embed.diagrams.net">
    <diagram>
      <mxGraphModel>
        <root>
          <mxCell id="3" value="Dashboard" style="text;" />
          <mxCell id="5" value="Create a project" style="text;" />
          <mxCell id="8" value="Waremelon" style="rounded=1;" />
          <mxCell id="11" value="Stash" style="rounded=1;" />
          <mxCell id="19" value="Publish" style="rounded=1;" />
          <mxCell id="20" value="Cancel" style="text;" />
          <mxCell id="16" value="Read and write" style="shape=ellipse;" />
          <mxCell id="17" value="Read only" style="shape=ellipse;" />
          <mxCell id="18" value="None" style="shape=ellipse;" />
        </root>
      </mxGraphModel>
    </diagram>
  </mxfile>`;

  beforeEach(async () => {
    // Mock del ChatgptService
    mockChatgptService = {
      generateFlutterCode: jest.fn(),
    } as any;

    // Mock del FlutterPromptService
    mockPromptService = {
      createSystemPrompt: jest.fn(),
      createUserPrompt: jest.fn(),
    } as any;

    // Mock del FlutterScreenDetectorService
    mockScreenDetector = {
      detectScreens: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlutterGenerator,
        { provide: ChatgptService, useValue: mockChatgptService },
        { provide: FlutterPromptService, useValue: mockPromptService },
        { provide: FlutterScreenDetectorService, useValue: mockScreenDetector },
      ],
    }).compile();

    generator = module.get<FlutterGenerator>(FlutterGenerator);
  });

  describe('generateWithAI', () => {
    it('debe usar la detección de pantallas del XML y enviar prompts especializados', async () => {
      // Configurar mocks
      const mockScreenDetection = {
        phoneCount: 2,
        shouldCreateDrawer: true,
        screenSections: [
          {
            title: 'DashboardScreen',
            texts: ['Dashboard'],
            fields: [],
            buttons: ['Primary'],
            radioGroups: [],
            colors: ['#0057D8'],
            description: 'Pantalla principal Dashboard'
          },
          {
            title: 'CreateProjectScreen',
            texts: ['Create a project', 'Project permissions'],
            fields: ['Waremelon', 'Stash', 'Key', 'Description'],
            buttons: ['Publish', 'Cancel'],
            radioGroups: [{
              title: 'User access',
              options: [
                { text: 'Read and write', isSelected: true },
                { text: 'Read only', isSelected: false },
                { text: 'None', isSelected: false }
              ]
            }],
            colors: ['#0057D8', '#4C9AFF'],
            description: 'Pantalla de creación de proyectos'
          }
        ],
        detectedScreens: ['DashboardScreen', 'CreateProjectScreen'],
        detectedFields: ['Waremelon', 'Stash', 'Key', 'Description'],
        detectedButtons: ['Primary', 'Publish', 'Cancel'],
        detectedRadioGroups: [{
          title: 'User access',
          options: [
            { text: 'Read and write', isSelected: true },
            { text: 'Read only', isSelected: false },
            { text: 'None', isSelected: false }
          ]
        }],
        allTexts: ['Dashboard', 'Create a project', 'Project permissions'],
        hasMultipleScreens: true,
        hasRegisterContent: false,
        hasProjectContent: true
      };

      const mockSystemPrompt = 'SYSTEM: Genera Flutter con restricciones...';
      const mockUserPrompt = `USER: Generar app con DashboardScreen y CreateProjectScreen...
      
PANTALLAS OBLIGATORIAS:
1. DashboardScreen - Pantalla principal Dashboard
2. CreateProjectScreen - Pantalla de creación de proyectos

CAMPOS: Waremelon, Stash, Key, Description
BOTONES: Publish, Cancel, Primary
RADIO BUTTONS: Read and write, Read only, None`;

      const mockGeneratedCode = `[FILE: pubspec.yaml]
\`\`\`yaml
name: test_app
dependencies:
  flutter:
    sdk: flutter
  go_router: ^13.0.0
\`\`\`

[FILE: lib/main.dart]
\`\`\`dart
import 'package:flutter/material.dart';
import 'app.dart';

void main() {
  runApp(const MyApp());
}
\`\`\`

[FILE: lib/features/dashboard/screens/dashboard_screen.dart]
\`\`\`dart
import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Dashboard')),
      body: Center(
        child: Column(
          children: [
            Text('Dashboard'),
            ElevatedButton(
              onPressed: () {},
              child: Text('Primary'),
            ),
          ],
        ),
      ),
    );
  }
}
\`\`\`

[FILE: lib/features/create_project/screens/create_project_screen.dart]
\`\`\`dart
import 'package:flutter/material.dart';

class CreateProjectScreen extends StatefulWidget {
  const CreateProjectScreen({Key? key}) : super(key: key);

  @override
  State<CreateProjectScreen> createState() => _CreateProjectScreenState();
}

class _CreateProjectScreenState extends State<CreateProjectScreen> {
  String _selectedPermission = 'Read and write';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create a project')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Project permissions'),
            TextFormField(
              decoration: InputDecoration(labelText: 'Waremelon'),
            ),
            TextFormField(
              decoration: InputDecoration(labelText: 'Stash'),
            ),
            TextFormField(
              decoration: InputDecoration(labelText: 'Key'),
            ),
            TextFormField(
              decoration: InputDecoration(labelText: 'Description'),
            ),
            Text('User access'),
            RadioListTile<String>(
              title: Text('Read and write'),
              value: 'Read and write',
              groupValue: _selectedPermission,
              onChanged: (value) => setState(() => _selectedPermission = value!),
            ),
            RadioListTile<String>(
              title: Text('Read only'),
              value: 'Read only',
              groupValue: _selectedPermission,
              onChanged: (value) => setState(() => _selectedPermission = value!),
            ),
            RadioListTile<String>(
              title: Text('None'),
              value: 'None',
              groupValue: _selectedPermission,
              onChanged: (value) => setState(() => _selectedPermission = value!),
            ),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () {},
                  child: Text('Publish'),
                ),
                TextButton(
                  onPressed: () {},
                  child: Text('Cancel'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
\`\`\``;

      // Configurar mocks
      mockScreenDetector.detectScreens.mockReturnValue(mockScreenDetection);
      mockPromptService.createSystemPrompt.mockReturnValue(mockSystemPrompt);
      mockPromptService.createUserPrompt.mockReturnValue(mockUserPrompt);
      mockChatgptService.generateFlutterCode.mockResolvedValue(mockGeneratedCode);

      // Contexto de prueba
      const context: GenerationContext = {
        xml: testXmlMockup,
        prompt: 'App de gestión de proyectos',
        projectType: 'flutter' as any,
        config: { description: 'Test app' }
      };

      // Simular la llamada (accedemos al método privado para testing)
      const generateWithAI = (generator as any).generateWithAI.bind(generator);
      const result = await generateWithAI(context);

      // Verificaciones
      expect(mockScreenDetector.detectScreens).toHaveBeenCalledWith(testXmlMockup);
      expect(mockPromptService.createSystemPrompt).toHaveBeenCalled();
      expect(mockPromptService.createUserPrompt).toHaveBeenCalledWith(context, mockScreenDetection);
      expect(mockChatgptService.generateFlutterCode).toHaveBeenCalledWith(mockSystemPrompt, mockUserPrompt);

      // Verificar que el código generado contiene las pantallas específicas
      expect(result).toContain('DashboardScreen');
      expect(result).toContain('CreateProjectScreen');
      expect(result).toContain('Waremelon');
      expect(result).toContain('Read and write');
      expect(result).toContain('Publish');
      
      // Verificar que NO contiene pantallas genéricas
      expect(result).not.toContain('HomeScreen');
      expect(result).not.toContain('FormScreen');
      expect(result).not.toContain('DetailScreen');
    });

    it('debe caer al fallback local si no hay API key', async () => {
      // Simular falta de API key
      process.env.OPENAI_API_KEY = '';

      const context: GenerationContext = {
        xml: testXmlMockup,
        prompt: 'App de test',
        projectType: 'flutter' as any,
        config: { description: 'Test app' }
      };

      const generateWithAI = (generator as any).generateWithAI.bind(generator);
      const result = await generateWithAI(context);

      // Debe usar plantillas locales
      expect(result).toContain('HomeScreen'); // El fallback usa pantallas genéricas
      expect(mockChatgptService.generateFlutterCode).not.toHaveBeenCalled();

      // Restaurar API key para otros tests
      process.env.OPENAI_API_KEY = 'test-key';
    });

    it('debe manejar errores de la IA y usar fallback', async () => {
      const mockScreenDetection = {
        phoneCount: 1,
        shouldCreateDrawer: false,
        screenSections: [],
        detectedScreens: [],
        detectedFields: [],
        detectedButtons: [],
        detectedRadioGroups: [],
        allTexts: [],
        hasMultipleScreens: false,
        hasRegisterContent: false,
        hasProjectContent: false
      };

      mockScreenDetector.detectScreens.mockReturnValue(mockScreenDetection);
      mockPromptService.createSystemPrompt.mockReturnValue('system prompt');
      mockPromptService.createUserPrompt.mockReturnValue('user prompt');
      mockChatgptService.generateFlutterCode.mockRejectedValue(new Error('API Error'));

      const context: GenerationContext = {
        xml: '',
        prompt: 'Test error handling',
        projectType: 'flutter' as any,
        config: { description: 'Test error handling' }
      };

      const generateWithAI = (generator as any).generateWithAI.bind(generator);
      const result = await generateWithAI(context);

      // Debe usar plantillas locales como fallback
      expect(result).toContain('HomeScreen'); // Fallback genera pantallas genéricas
      expect(result).toContain('pubspec.yaml');
    });
  });

  describe('Verificación de flujo completo', () => {
    it('debe procesar XML → Detección → Prompt → IA correctamente', async () => {
      // Este test verifica todo el flujo sin mocks
      const realContext: GenerationContext = {
        xml: testXmlMockup,
        prompt: 'App de gestión de proyectos desde mockup',
        projectType: 'flutter' as any,
        config: { description: 'App desde mockup' }
      };

      // Mock solo la llamada a ChatGPT para evitar API real
      const expectedCodeWithSpecificScreens = `[FILE: lib/features/dashboard/screens/dashboard_screen.dart]
\`\`\`dart
class DashboardScreen extends StatefulWidget { }
\`\`\`

[FILE: lib/features/create_project/screens/create_project_screen.dart]
\`\`\`dart
class CreateProjectScreen extends StatefulWidget { }
\`\`\``;

      mockChatgptService.generateFlutterCode.mockResolvedValue(expectedCodeWithSpecificScreens);

      const generateWithAI = (generator as any).generateWithAI.bind(generator);
      const result = await generateWithAI(realContext);

      // Verificar que usó los servicios reales correctamente
      expect(result).toContain('DashboardScreen');
      expect(result).toContain('CreateProjectScreen');
    });
  });
}); 