// import { Body, Controller, Post, UseGuards } from "@nestjs/common";
// import { Roles } from "src/decorators/roles.decorator";
// import { RolesGuard } from "src/guards/roles.guard";

// @Controller('inventory')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class InventoryController {
//   constructor(private readonly inventoryService: InventoryService) {}

//   @Post()
//   @Roles('Admin', 'InventoryManager')
//   async create(@Body() createItemDto: Cre) {
//     return this.inventoryService.create(createItemDto);
//   }
// }