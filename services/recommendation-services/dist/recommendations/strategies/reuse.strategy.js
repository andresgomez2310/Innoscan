"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReuseStrategy = void 0;
class ReuseStrategy {
    constructor() {
        this.name = 'Reutilizar';
        this.strategyKey = 'reuseStrategy';
    }
    generate(itemName, condition) {
        const good = ['nuevo', 'bueno'].includes(condition);
        return [
            { title: `Donar "${itemName}" a una organización local`, confidence: good ? 92 : 70, effort: 'bajo' },
            { title: `Vender "${itemName}" en marketplace de segunda mano`, confidence: good ? 88 : 62, effort: 'bajo' },
            { title: `Intercambiar en una comunidad de trueque`, confidence: 74, effort: 'medio' },
        ];
    }
}
exports.ReuseStrategy = ReuseStrategy;
//# sourceMappingURL=reuse.strategy.js.map