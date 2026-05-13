import { PrismaService } from '../prisma/prisma.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
export declare class IdeasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    findAll(estado?: string): Promise<any>;
    create(dto: CreateIdeaDto): Promise<any>;
    updateEstado(id: string, estado: string): Promise<any>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
