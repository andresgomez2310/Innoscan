import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ScansClientService } from './scans.client.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@Controller('scans')
export class ScansController {
  constructor(private readonly service: ScansClientService) {}

  @Post()
  create(@Body() dto: CreateScanDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.service.findAll(page, limit);
  }

  @Get('stats')
  stats() {
    return this.service.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScanDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}