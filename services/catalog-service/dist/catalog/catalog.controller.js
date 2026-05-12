"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const catalog_service_1 = require("./catalog.service");
const create_producto_dto_1 = require("./dto/create-producto.dto");
let CatalogController = class CatalogController {
    constructor(service) {
        this.service = service;
    }
    findAll(payload) {
        return this.service.findAll(payload?.search, payload?.categoria);
    }
    getCategories() {
        return this.service.getCategories();
    }
    create(dto) {
        return this.service.create(dto);
    }
    remove(payload) {
        return this.service.remove(payload.id);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, microservices_1.MessagePattern)('catalog.findAll'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('catalog.getCategories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "getCategories", null);
__decorate([
    (0, microservices_1.MessagePattern)('catalog.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_producto_dto_1.CreateProductoDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('catalog.remove'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "remove", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map