import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Init from './app.init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Init()
  await app.listen(3000);
}
bootstrap();
