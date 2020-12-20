# load-goblin
Mass loading of JSON and YAML files

## Getting started

First install the package and awilix:

```bash
npm i load-goblin
```

Then, use it to load your files:

```js
import { resolve } from 'path'
import { loadFiles } from 'load-goblin'

function getPath(rootDir = '') {
  return resolve(__dirname, 'files', rootDir)
}

const filesLoaded = await loadFiles({
  rootDirectory: getPath(),
  recursively: true,
  filter: '*/abc*.json',
})
```

## Supported config options
`rootDirectory` - required parameter. Specifies full path for a directory from which loading will be initiated;
`recursively` - optional parameter. If set to true, loading will include subdirectories;
`filter` - optional parameter. Can be either a simple text matching rule (supporting `*` for any amount of any symbols in the path), or a `(path: string) => boolean` matcher function.

## Output

Loader returns an array of entities, where each entry represents one file. Format:
```
{
    "content": "data=content",
    "name": "root.txt",
    "path": "C:/sources/node/load-goblin/test/files",
}
```

Note that JSON and YAML files are automatically parsed into objects. All other files are returned as text.
