"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyFactory = void 0;
const common_1 = require("@nestjs/common");
const reuse_strategy_1 = require("./reuse.strategy");
const transform_strategy_1 = require("./transform.strategy");
const reconfigure_strategy_1 = require("./reconfigure.strategy");
class StrategyFactory {
    static create(strategyKey) {
        const s = this.strategies[strategyKey];
        if (!s)
            throw new common_1.BadRequestException(`[Strategy] Clave desconocida: "${strategyKey}". Válidas: ${Object.keys(this.strategies).join(', ')}`);
        return s;
    }
}
exports.StrategyFactory = StrategyFactory;
StrategyFactory.strategies = {
    reuseStrategy: new reuse_strategy_1.ReuseStrategy(),
    transformStrategy: new transform_strategy_1.TransformStrategy(),
    reconfigureStrategy: new reconfigure_strategy_1.ReconfigureStrategy(),
};
//# sourceMappingURL=strategy.factory.js.map