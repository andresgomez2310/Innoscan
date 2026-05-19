import { 
  Controller, Get, Post, Patch, Delete, Param, Body, 
  Query, ParseIntPipe, DefaultValuePipe, Req 
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { ScansClientService } from './scans.client.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@UseGuards(SupabaseAuthGuard)
@Controller('scans')
export class ScansController {
  constructor(private readonly service: ScansClientService) {}

  @Post()
  create(@Body() dto: CreateScanDto, @Req() req: any) {
    const userId = req.user.id; // Extraído del JWT por el Guard
    return this.service.create({ ...dto, userId });
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.id;
    return this.service.findAll(userId, page, limit);
  }

  @Get('stats')
  stats(@Req() req: any) {
    const userId = req.user.id; // Vital para que el dashboard no sume todo lo de la DB
    return this.service.getStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.service.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScanDto, @Req() req: any) {
    const userId = req.user.id;
    return this.service.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.service.remove(id, userId);
  }
}