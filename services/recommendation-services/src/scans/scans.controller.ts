import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';

@Controller()
export class ScansController {
  constructor(private readonly service: ScansService) {}

  @MessagePattern('scans.create')
  create(@Payload() dto: CreateScanDto) {
    return this.service.create(dto);
  }

  @MessagePattern('scans.findAll')
  findAll(@Payload() payload: { page?: number; limit?: number }) {
    return this.service.findAll(payload?.page, payload?.limit);
  }

  @MessagePattern('scans.findOne')
  findOne(@Payload() payload: { id: string }) {
    return this.service.findOne(payload.id);
  }

  @MessagePattern('scans.update')
  update(@Payload() payload: { id: string; dto: UpdateScanDto }) {
    return this.service.update(payload.id, payload.dto);
  }

  @MessagePattern('scans.getStats')
  getStats() {
    return this.service.getStats();
  }

  @MessagePattern('scans.remove')
  remove(@Payload() payload: { id: string }) {
    return this.service.remove(payload.id);
  }
}