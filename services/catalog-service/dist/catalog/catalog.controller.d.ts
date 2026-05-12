import { CatalogService } from './catalog.service';
import { CreateProductoDto } from './dto/create-producto.dto';
export declare class CatalogController {
    private readonly service;
    constructor(service: CatalogService);
    findAll(payload: {
        search?: string;
        categoria?: string;
    }): Promise<any>;
    getCategories(): Promise<any>;
    create(dto: CreateProductoDto): Promise<any>;
    remove(payload: {
        id: string;
    }): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
