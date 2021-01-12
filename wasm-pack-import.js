/**
 * This plugin is a quick example (this is more a POC code) It need to be cleand up and some checks need to be added.
 * I am looking forward for a pull request with a cleaned version. :)
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

/**
 * bundle wasm-pack node module. !!! wasm-pack output need to be from target type web !!!
 * this also works when wasm will be used in worker or service workers
 * @param {Object} options import options
 * @param {string} options.outputDir wasm output directory
 * @param {boolean} options.copy true: copy the was file into the output directory
 * @param {Object} options.mapping mapping to define output wasm file name (key = package-name, value: output wasm file name)
 * @param {string} options.serverPath Directory on your server where the .wasm files will be loaded from. This is prepended to the URL, so you should put a / at the end of the directory, e.g. "/foo/".
 */
function wasmPackImport(options) {

    // wasm resource files
    const resources = {};
    options = options || {};
    options.serverPath = options.serverPath || '';

    return {
        load: async (id) => {
            let result = null;            
            const resourceInfo = await getResourceInfo(id);
            const map = resourceInfo
                        ? options?.mapping[resourceInfo.packageName]
                        : null;
            if (map) {
                if (options.copy) {                    
                    const buffer = await fs.promises.readFile(resourceInfo.wasmFile);
                    resources[id] = {                    
                        output: options.outputDir ? `${options.outputDir}/${map}` : map,
                        buffer: buffer
                    };
                }
                let content = await fs.promises.readFile(id, 'utf8');                
                result = content.replace("import.meta.url.replace(/\\.js$/, '_bg.wasm');", `'${options.serverPath}${map}';`);                
            }
            return result;
        },
        generateBundle: function() {

            return Promise.all(
                Object.keys(resources).map(id => {
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

/** get getResourceInfo
 * @param {string} id
 * @return {Promise<{ wasmFile: string, packageName: string }>} path of the wasm file name read from the package json in the folder
 */
async function getResourceInfo(id) {
    let result = null;
    try {
        const dirName = path.dirname(id);
        // check if there is a package file in the same directory
        const packageJson = `${dirName}/package.json`;    
        const hasPackageJson = await fileExists(packageJson);    
        if (hasPackageJson) {
            const packageJsonRaw = await fs.promises.readFile(packageJson, { encoding: 'utf8' });
            const packageJsonItem = JSON.parse(packageJsonRaw);                        
            const wasmFileName = packageJsonItem?.files?.find(name => name.endsWith('.wasm'));
            if (wasmFileName?.length > 0 && packageJsonItem?.name?.length > 0) {
                result = {
                    wasmFile: `${dirName}/${wasmFileName}`,
                    packageName: packageJsonItem.name,
                };
            }
        }
    }
    catch(e) {
        console.error(`Error while getting resource info for ${id}`, e);
    }
    return Promise.resolve(result);
}

/** check if file exists
 * @param {string} path
 * @return {Promise<boolean>} return tur if the file exists
 */
function fileExists(path) {
    return fs.promises.access(path, fs.constants.F_OK)
                    .then(() => true)
                    .catch(() => false);
}

module.exports = wasmPackImport;