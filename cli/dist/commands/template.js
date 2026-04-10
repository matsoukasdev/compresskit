"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = template;
const output_1 = require("../core/output");
const VALID = ['loyalty', 'gaming', 'social'];
function template(type, opts) {
    if (!VALID.includes(type)) {
        console.error(`\n  error: unknown template '${type}'`);
        console.error(`  valid types: ${VALID.join(', ')}`);
        process.exit(1);
    }
    (0, output_1.heading)(`compresskit template — ${type}`);
    (0, output_1.info)('type', type);
    (0, output_1.info)('output', opts.output);
    (0, output_1.info)('status', 'scaffolding...');
    (0, output_1.success)(`${type} template ready at ${opts.output}`);
}
//# sourceMappingURL=template.js.map