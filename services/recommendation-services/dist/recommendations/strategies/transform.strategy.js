"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformStrategy = void 0;
class TransformStrategy {
    constructor() {
        this.name = 'Transformar';
        this.strategyKey = 'transformStrategy';
    }
    generate(itemName, condition) {
        const repairable = ['regular', 'dañado'].includes(condition);
        return [
            { title: `Upcycling: convertir "${itemName}" en elemento decorativo`, confidence: repairable ? 75 : 68, effort: 'alto' },
            { title: `Desmontar "${itemName}" para extraer piezas reutilizables`, confidence: 85, effort: 'medio' },
            { title: `Llevar a taller DIY comunitario`, confidence: 65, effort: 'alto' },
        ];
    }
}
exports.TransformStrategy = TransformStrategy;
//# sourceMappingURL=transform.strategy.js.map