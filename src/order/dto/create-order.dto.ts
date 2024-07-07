import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
    @ApiProperty({ example: "1", description: "Pizza id" })
    pizza_id: string;

    @ApiProperty({ example: "2", description: "Quantity" })
    quantity: number;

    @ApiProperty({ example: "1", description: "User id" })
    ordered_by: string;

    @ApiProperty({ example: "Address", description: "Full Address"})
    address: string;
}
