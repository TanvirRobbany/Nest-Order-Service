import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { DataCollection } from "./collection.schema";

@Schema()
export class Order extends Document {
    @Prop()
    pizza_id: string;

    @Prop()
    quantity: number;

    @Prop()
    ordered_by: string;

    @Prop()
    address: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.set('timestamps', true);
