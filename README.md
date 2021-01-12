# rollup-wasm-pack-import (Rollup plugin)

This plugin allows you to use WebAssembly built with wasm-pack in rollup. (+ This also works with (service)workers)

## Requirements

 - A npm module (or external) built with wasm-pack. (**it has to be built with target ``web``**)
 - Rollup + config

## Installation

```bash
npm install --save-dev rollup-wasm-pack-import
```

## Usage

``rollup.config.js``
```js
import wasmImport from 'rollup-wasm-pack-import';

{
    plugins: [        
        wasmImport({            
            copy: true,
            serverPath: '/',
            mapping: {
                'my-wasm-module': 'my-wasm.wasm'
            }
        })
        ...
    ]
}
```

### Options:

Options object to configure wasm-pack-import.

Property      | Type     | Description
--------------|----------|------------
copy          | boolean  | if ``true``, the wasm will be copied in your output directory
mapping       | object   | ``key:`` module name of your wasm-pack npm module<br>``value:`` the web assembly file name
outputDir     | string   | if ``copy`` is set to true, the wasm files will be copied in this directory
| serverPath  | string   | path from the serve url where the wasm file is located. The path should always must always end with '/'


### Your JS Code

Based on the current state of WebAssembly they need to be loaded async.

```js
// if its installed via npm
// if you are using a local directory built with wasm-pack, you can reference to '<relative-path>/pkg' (keep in mind to use the module name for options.mapping)
import * as wasm from 'my-wasm-module';

async function load() {
    // initialize the web assembly
    await wasm.default();
    console.log(wasm);
    // <your wasm code>
};
load();
```

## Changes

Version 2.0.0:
- changed: The plugin is taking the ``name`` from the "wasm-pack" built module (package.json) and the name of the ``wasm`` file aswell to check against the ``mapping key``.
- added: added a new option ``serverPath``


## Hint
I wrote this plugin for my personal specific prototypíng use case. This means if you have slightly differnt requirements this plugin should be more like an inspiration which you can use and adapt. (currently there are no error check / tests its more like a poc).
I am looking forward for a pull request with a cleaned version. :)