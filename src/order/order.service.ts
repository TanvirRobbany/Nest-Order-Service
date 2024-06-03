import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order} from './schemas/order.schema'
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor (
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('PIZZA_SERVICE') private readonly pizzaServiceClient: ClientProxy,
  ) {}
  
  async create(createOrderDto: CreateOrderDto): Promise<Object> {
    const result = await lastValueFrom(this.pizzaServiceClient.send('order_process', createOrderDto));
    if (result.status === 'accepted') {
      const newOrder = new this.orderModel(createOrderDto);
      newOrder.save();
    }
    return result;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find({}).exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    const updatedOrder = this.orderModel.findByIdAndUpdate(id, updateOrderDto, {new: true}).exec();
    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }

  async remove(id: string): Promise<string> {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    if (!deletedOrder) {
      throw new NotFoundException('Order not found');
    }
    return deletedOrder._id.toString() + ' deleted successfully';
  }
}
