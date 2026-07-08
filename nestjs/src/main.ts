import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones desde el frontend unificado
  app.enableCors();
  
  // Configurar validación global estandarizada
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    exceptionFactory: (errors) => {
      const result: Record<string, string> = {};
      errors.forEach(err => {
        const constraints = Object.values(err.constraints || {});
        result[err.property] = constraints.length > 0 ? constraints[0] : 'Invalid value';
      });
      return new BadRequestException({ validationErrors: result });
    }
  }));
  
  await app.listen(3001);
  console.log('Todo API listening on http://localhost:3001');
}

bootstrap();
