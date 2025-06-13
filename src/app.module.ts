import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DiagramasModule } from './diagramas/diagramas.module';
import { MockupsModule } from './mockups/mockups.module';
import { ChatgptModule } from './chatgpt/chatgpt.module';
import { MobileGeneratorModule } from './mobile-generator/mobile-generator.module';
import { DatabaseTestModule } from './database/database-test.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'backend_sw',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging: ['error', 'warn', 'info', 'log'],
      ssl: process.env.DB_SSL === 'true' ? { 
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' 
      } : false,
    }),
    UsuariosModule,
    AuthModule,
    DiagramasModule,
    MockupsModule,
    ChatgptModule,
    MobileGeneratorModule,
    DatabaseTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
