"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconfigureStrategy = void 0;
class ReconfigureStrategy {
    constructor() {
        this.name = 'Reconfigurar';
        this.strategyKey = 'reconfigureStrategy';
    }
    generate(itemName, condition) {
        const old = ['antiguo', 'raro'].includes(condition);
        return [
            { title: `Reparar y actualizar los componentes de "${itemName}"`, confidence: old ? 72 : 82, effort: 'medio' },
            { title: `Adaptar "${itemName}" para un propósito diferente`, confidence: 74, effort: 'medio' },
            { title: `Combinar con otros objetos para crear una nueva función`, confidence: 66, effort: 'alto' },
        ];
    }
}
exports.ReconfigureStrategy = ReconfigureStrategy;
//# sourceMappingURL=reconfigure.strategy.js.map