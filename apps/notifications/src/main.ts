import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';
import { DEFAULT_NATS_URL } from '@app/contracts';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationsModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL ?? DEFAULT_NATS_URL],
        // queue → todos los pods de notifications se suscriben al mismo "queue group"
        // y NATS reparte cada evento a UNA sola réplica. Sin esto, con 2 réplicas
        // cada orden generaría 2 notificaciones (procesamiento duplicado).
        queue: 'notifications',
      },
    },
  );

  await app.listen();
  Logger.log('notifications escuchando eventos NATS Server', 'Bootstrap');
}

bootstrap();
