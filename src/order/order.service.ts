import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose'
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema'
import { DataCollection } from './schemas/collection.schema';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(DataCollection.name) private dataCollectionModel: Model<DataCollection>,
    @InjectConnection() private connection: Connection,
    @Inject('PIZZA_SERVICE') private readonly pizzaServiceClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Object> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await lastValueFrom(this.pizzaServiceClient.send('order_process', createOrderDto));
      if (result.status === 'accepted') {
        const newOrder = new this.orderModel(createOrderDto);
        const dataCollection = new this.dataCollectionModel({ action: 'create', data: newOrder });
        await newOrder.save({ session });
        await dataCollection.save({ session });
      }

      await session.commitTransaction();
      this.orderGateway.sendOrderStatus(result);
      return result;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find({}).exec();
  }

  async findOne(id: string): Promise<Order> {
    return this.orderModel.findById(id).exec();
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const previousOrder = await this.orderModel.findById(id).exec();
      const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, { new: true, session }).exec();
      const dataCollection = new this.dataCollectionModel({ action: 'update', data: updatedOrder, previousData: previousOrder });
      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }

      await dataCollection.save({ session });
      await session.commitTransaction();
      return updatedOrder;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<string> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const previousOrder = await this.orderModel.findById(id).exec();
      const dataCollection = new this.dataCollectionModel({ action: 'delete', data: previousOrder });
      const deletedOrder = await this.orderModel.findByIdAndDelete(id, {session}).exec();
      if (!deletedOrder) {
        throw new NotFoundException('Order not found');
      }

      await dataCollection.save({ session });

      await session.commitTransaction();

      dataCollection.save();

      return deletedOrder._id.toString() + ' deleted successfully';
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
