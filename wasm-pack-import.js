const fs = require('fs');

/**
 * bundle wasm-pack node module. !!! wasm-pack output need to be from target type web !!!
 * this also works when wasm will be used in worker or service workers
 * @param {Object} options import options
 * @param {string} options.outputDir wasm output directory
 * @param {boolean} options.copy true: copy the was file into the output directory
 * @param {Object} options.mapping mapping to define output wasm file name (key = package-name, value: output wasm file name)
 */
function wasmPackImport(options) {

    // wasm resource files
    const resources = {};

    return {
        load: async (id) => {
            let result = null;
            const fileName = getJsFileName(id);
            const map = options.mapping[fileName];
            if (map) {
                if (options.copy) {
                    const wasmSourceFile = id.replace(/^(.*\/[^\/]*)\.js$/, '$1_bg.wasm');
                    const buffer = await fs.promises.readFile(wasmSourceFile);
                    resources[id] = {                    
                        output: options.outputDir ? `${options.outputDir}/${map}` : map,
                        buffer: buffer
                    };
                }
                let content = await fs.promises.readFile(id, 'utf8');
                result = content.replace("import.meta.url.replace(/\\.js$/, '_bg.wasm');", `'${map}';`);                
            }
            return result;
        },
        generateBundle: function() {

            return Promise.all(
                Object.keys(resources).map(async id => {
                    let file = resources[id];
                    return this.emitFile({
                        type: 'asset',
                        source: file.buffer,
                        fileName: file.output
                    });
                })
            );
        }
    }
}

/**
 * get js file name
 * @param {string} id 
 */
function getJsFileName(id) {
    const rx = /([^\/]*).js$/;    
    return rx.test(id)
        ? id.match(rx)[1]
        : null;
}


module.exports = wasmPackImport;