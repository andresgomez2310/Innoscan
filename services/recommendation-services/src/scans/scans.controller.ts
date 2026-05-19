import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@Controller()
export class ScansController {
  constructor(private readonly service: ScansService) {}

  @MessagePattern('scans.create')
  create(@Payload() dto: CreateScanDto & { userId: string }) {
    return this.service.create(dto);
  }

  @MessagePattern('scans.findAll')
  findAll(@Payload() payload: { userId: string; page?: number; limit?: number }) {
    return this.service.findAll(payload.userId, payload?.page, payload?.limit);
  }

  @MessagePattern('scans.findOne')
  findOne(@Payload() payload: { id: string; userId: string }) {
    return this.service.findOne(payload.id, payload.userId);
  }

  @MessagePattern('scans.update')
  update(@Payload() payload: { id: string; userId: string; dto: UpdateScanDto }) {
    return this.service.update(payload.id, payload.userId, payload.dto);
  }

  @MessagePattern('scans.getStats')
  getStats(@Payload() payload: { userId: string }) {
    return this.service.getStats(payload.userId);
  }

  @MessagePattern('scans.remove')
  remove(@Payload() payload: { id: string; userId: string }) {
    return this.service.remove(payload.id, payload.userId);
  }
}