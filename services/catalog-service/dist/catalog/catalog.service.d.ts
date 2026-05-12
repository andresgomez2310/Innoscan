import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class CatalogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private get db();
    findAll(search?: string, categoria?: string): Promise<any>;
    getCategories(): Promise<any>;
    create(dto: CreateProductoDto): Promise<any>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
