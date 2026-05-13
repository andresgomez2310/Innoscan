import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FeedbackClientService {
  constructor(@Inject('FEEDBACK_SERVICE') private readonly client: ClientProxy) {}

  create(dto: any) {
    return firstValueFrom(this.client.send('feedback.create', dto));
  }

  findAll(minRating?: number, resultId?: string) {
    return firstValueFrom(this.client.send('feedback.findAll', { minRating, resultId }));
  }

  findAllIdeas(estado?: string) {
    return firstValueFrom(this.client.send('ideas.findAll', { estado }));
  }

  createIdea(dto: any) {
    return firstValueFrom(this.client.send('ideas.create', dto));
  }

  updateEstado(id: string, estado: string) {
    return firstValueFrom(this.client.send('ideas.updateEstado', { id, estado }));
  }

  removeIdea(id: string) {
    return firstValueFrom(this.client.send('ideas.remove', { id }));
  }
}