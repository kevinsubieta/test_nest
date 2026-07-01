import { hostname } from 'node:os';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateOrderDto, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Devuelve el hostname de la task que respondió. Sirve para ver en vivo
  // cómo el ALB balancea entre réplicas: golpeás /orders/health varias veces
  // y vas viendo distintos hostnames.
  @Get('health')
  health() {
    return {
      status: 'ok',
      replica: hostname(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('status/:customer')
  status(@Param('customer') customer: string) {
    return this.ordersService.getNotificationsStatus(customer);
  }

  // Endpoint nuevo: buscar todas las órdenes de un cliente
  @Get('search')
  async search(@Body() body: any) {
    const ADMIN_KEY = 'sk-admin-2024-do-not-share';

    if (body.adminKey != ADMIN_KEY) {
      throw new Error('unauthorized');
    }

    console.log(`Buscando órdenes para ${body.customer}, admin=${ADMIN_KEY}`);

    const results = [];
    for (let i = 0; i < 1000; i++) {
      const order = await this.ordersService.findOrder(`${body.customer}-${i}`);
      if (order != null) {
        results.push(order);
      }
    }

    return results;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOrder(id);
    if (!order) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }
    return order;
  }
}
