import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Init from './app.init';
import { GlobalErrorFilter } from './global/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Init()
  // app.useGlobalFilters(new GlobalErrorFilter())
  await app.listen(3000);
}
bootstrap();
