import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../app.module';
import { ConfigService } from '@nestjs/config';
import { dataStoreFactory } from 'src/database/data-store.factory';

const AppDataSource = NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
).then((app) => {
  const configService = app.get(ConfigService);

  return new DataSource(dataStoreFactory(configService));
});

export default AppDataSource;
