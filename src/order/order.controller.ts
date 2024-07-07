import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EventPattern } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201, description: 'The order has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'The orders have been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'The order has been successfully retrieved.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    description: 'The new values for the order',
    schema: {
      example: {
        pizza_id: "665d962b7b4a2dff52699a9a",
        quantity: 3,
        ordered_by: "Tanvir",
        address: "Prolific Infotech",
      }
    }
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
