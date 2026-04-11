"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = template;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const output_1 = require("../core/output");
const templates_1 = require("../core/templates");
const VALID = ['loyalty', 'gaming', 'social'];
function template(type, opts) {
    if (!VALID.includes(type)) {
        console.error(`\n  error: unknown template '${type}'`);
        console.error(`  valid types: ${VALID.join(', ')}`);
        process.exit(1);
    }
    const tmplType = type;
    const tmplInfo = (0, templates_1.getTemplateInfo)(tmplType);
    const outDir = path_1.default.resolve(opts.output);
    (0, output_1.heading)(`compresskit template — ${tmplType}`);
    (0, output_1.info)('type', `${tmplInfo.label} (${tmplInfo.desc})`);
    (0, output_1.info)('output', outDir);
    const spin = (0, output_1.spinner)('scaffolding project...');
    spin.start();
    // get all files for this template
    const files = (0, templates_1.getTemplateFiles)(tmplType);
    // create dirs + write files
    let fileCount = 0;
    for (const f of files) {
        const fullPath = path_1.default.join(outDir, f.path);
        const dir = path_1.default.dirname(fullPath);
        fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(fullPath, f.content, 'utf-8');
        fileCount++;
    }
    spin.succeed(`${fileCount} files created`);
    // print file tree
    console.log('');
    for (const f of files) {
        const depth = f.path.split('/').length - 1;
        const indent = '  ' + '  '.repeat(depth);
        const name = path_1.default.basename(f.path);
        (0, output_1.info)(indent + name, f.path);
    }
    (0, output_1.success)(`${tmplType} template ready at ${outDir}`);
    console.log('');
    (0, output_1.info)('next steps', `cd ${opts.output} && anchor build`);
}
//# sourceMappingURL=template.js.map