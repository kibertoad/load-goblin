import { loadFiles, LoadingResult } from '../lib/loader'
import { resolve } from 'path'

describe('loader', () => {
  function getPath(rootDir = '') {
    return resolve(__dirname, 'files', rootDir)
  }

  // Makes assertion work across platform
  function cutPathRoot(filesLoaded: LoadingResult) {
    filesLoaded.forEach((entry) => {
      entry.path = entry.path.substring(entry.path.indexOf('/load-goblin/') + 1)
    })
    return filesLoaded
  }

  it('loads files non-recursively', async () => {
    const filesLoaded = await loadFiles({ rootDirectory: getPath() })
    expect(cutPathRoot(filesLoaded)).toMatchSnapshot()
  })

  it('loads files recursively', async () => {
    const filesLoaded = await loadFiles({ rootDirectory: getPath(), recursively: true })
    expect(cutPathRoot(filesLoaded)).toMatchSnapshot()
  })

  it('loads files recursively with text filter', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: '*/abc*.json',
    })
    expect(cutPathRoot(filesLoaded)).toMatchSnapshot()
  })

  it('loads files recursively with text filter (ignores slash style)', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: '*\\abc*.json',
    })
    expect(cutPathRoot(filesLoaded)).toMatchSnapshot()
  })

  it('loads files recursively with function filter', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: (file) => {
        return file.includes('def')
      },
    })
    expect(cutPathRoot(filesLoaded)).toMatchSnapshot()
  })
})
