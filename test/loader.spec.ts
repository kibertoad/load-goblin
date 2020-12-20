import { loadFiles } from '../lib/loader'
import { resolve } from 'path'

describe('loader', () => {
  function getPath(rootDir = '') {
    return resolve(__dirname, 'files', rootDir)
  }

  it('loads files non-recursively', async () => {
    const filesLoaded = await loadFiles({ rootDirectory: getPath() })
    expect(filesLoaded).toMatchSnapshot()
  })

  it('loads files recursively', async () => {
    const filesLoaded = await loadFiles({ rootDirectory: getPath(), recursively: true })
    expect(filesLoaded).toMatchSnapshot()
  })

  it('loads files recursively with text filter', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: '*/abc*.json',
    })
    expect(filesLoaded).toMatchSnapshot()
  })

  it('loads files recursively with text filter (ignores slash style)', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: '*\\abc*.json',
    })
    expect(filesLoaded).toMatchSnapshot()
  })

  it('loads files recursively with function filter', async () => {
    const filesLoaded = await loadFiles({
      rootDirectory: getPath(),
      recursively: true,
      filter: (file) => {
        return file.includes('def')
      },
    })
    expect(filesLoaded).toMatchSnapshot()
  })
})
