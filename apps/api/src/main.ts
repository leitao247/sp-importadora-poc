import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { env } from "./env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("S&P Importadora – API")
    .setDescription("API do e-commerce B2C de vinhos (dropshipping via distribuidores)")
    .setVersion("0.1.0")
    .addApiKey({ type: "apiKey", in: "header", name: "x-admin-key" }, "AdminApiKey")
    .addApiKey({ type: "apiKey", in: "header", name: "x-distributor-key" }, "DistributorApiKey")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(env.API_PORT);
  console.log(`🚀 API rodando em http://localhost:${env.API_PORT}`);
  console.log(`📚 Swagger em http://localhost:${env.API_PORT}/docs`);
}

bootstrap();
