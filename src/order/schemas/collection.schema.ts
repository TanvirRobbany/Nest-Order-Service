import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose,{ Document } from "mongoose";

@Schema()
export class DataCollection extends Document {
    @Prop()
    action: string;

    @Prop()
    data: mongoose.Schema.Types.Mixed;
    
    @Prop()
    previousData: mongoose.Schema.Types.Mixed;
}

export const DataCollectionSchema = SchemaFactory.createForClass(DataCollection);
DataCollectionSchema.set('timestamps', true);