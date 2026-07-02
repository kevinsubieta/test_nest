import { hostname } from 'node:os';
import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrderDto, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

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
    this.logger.log(`Nueva orden recibida: ${JSON.stringify(dto)}`);
    return this.ordersService.createOrder(dto);
  }

  @Get('search')
  search(
    @Query('customer') customer: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.searchByCustomer(customer, limit);
  }

  @Get('status/:customer')
  status(@Param('customer') customer: string) {
    return this.ordersService.getNotificationsStatus(customer);
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
