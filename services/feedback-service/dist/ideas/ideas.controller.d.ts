import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
export declare class IdeasController {
    private readonly service;
    constructor(service: IdeasService);
    findAll(payload: {
        estado?: string;
    }): Promise<any>;
    create(dto: CreateIdeaDto): Promise<any>;
    updateEstado(payload: {
        id: string;
        estado: string;
    }): Promise<any>;
    remove(payload: {
        id: string;
    }): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
