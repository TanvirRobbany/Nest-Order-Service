import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order} from './schemas/order.schema'
import { DataCollection } from './schemas/collection.schema';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor (
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(DataCollection.name) private dataCollectionModel: Model<DataCollection>,
    @Inject('PIZZA_SERVICE') private readonly pizzaServiceClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
  ) {}
  
  async create(createOrderDto: CreateOrderDto): Promise<Object> {
    const result = await lastValueFrom(this.pizzaServiceClient.send('order_process', createOrderDto));
    if (result.status === 'accepted') {
      const newOrder = new this.orderModel(createOrderDto);
      const dataCollection = new this.dataCollectionModel({ action: 'create', data: newOrder });
      newOrder.save();
      dataCollection.save();
    }

    this.orderGateway.sendOrderStatus(result);

    return result;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find({}).exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const previousOrder = await this.orderModel.findById(id).exec();
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {new: true}).exec();
    const dataCollection = new this.dataCollectionModel({ action: 'update', data: updatedOrder, previousData: previousOrder });
    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    dataCollection.save();

    return updatedOrder;
  }

  async remove(id: string): Promise<string> {
    const previousOrder = await this.orderModel.findById(id).exec();
    const dataCollection = new this.dataCollectionModel({ action: 'delete', data: previousOrder });
    const deletedOrder = await this.orderModel.findByIdAndDelete(id).exec();
    if (!deletedOrder) {
      throw new NotFoundException('Order not found');
    }

    dataCollection.save();

    return deletedOrder._id.toString() + ' deleted successfully';
  }
}
