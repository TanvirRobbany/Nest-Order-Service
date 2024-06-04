import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway()
export class OrderGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('processOrder') 
    processOrder(@MessageBody() data: any) {
        console.log('processOrder', data);
        this.server.emit('orderProcessed', data);
    }

    sendOrderStatus(data: any) {
        this.server.emit('orderStatus', data);
    }
}