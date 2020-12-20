import { Dirent } from 'fs'
import { isMatch } from 'matcher'

import { promises as fs } from 'fs'
import { resolve } from 'path'
import { safeLoad } from 'js-yaml'

export type Filter = (file: string) => boolean

export type Config = {
  rootDirectory: string
  recursively?: boolean
  filter?: string | Filter
}

export type LoadingResult = {
  content: any
  name: string
  path: string
}[]

async function getFilesInDirectory(directory: string) {
  const allEntries: Dirent[] = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []
  const directories: string[] = []

  allEntries.forEach((entry) => {
    if (entry.isFile()) {
      files.push(entry.name)
    }
    if (entry.isDirectory()) {
      directories.push(entry.name)
    }
  })

  return {
    files,
    directories,
  }
}

async function loadContent(path: string): Promise<any> {
  if (path.toLowerCase().endsWith('json')) {
    return require(path)
  }

  const fileContents = await fs.readFile(path, 'utf8')
  if (path.toLowerCase().endsWith('yml') || path.toLowerCase().endsWith('yaml')) {
    return safeLoad(fileContents)
  }

  return fileContents
}

function normalizePath(originalPath: string): string {
  return originalPath.replace(/\\/g, '/')
}

async function accumulateFiles(
  result: LoadingResult,
  currentDirectory: string,
  pathSoFar: string,
  filter: Filter,
  recursively = false
): Promise<void> {
  const resolvedDirectoryPath = resolve(pathSoFar, currentDirectory)
  const directoryEntries = await getFilesInDirectory(resolvedDirectoryPath)

  for await (const file of directoryEntries.files) {
    const resolvedFullPath = resolve(resolvedDirectoryPath, file)

    if (filter(resolvedFullPath)) {
      const content = await loadContent(resolvedFullPath)
      result.push({
        path: normalizePath(resolvedDirectoryPath),
        name: file,
        content,
      })
    }
  }

  if (recursively) {
    for await (const directory of directoryEntries.directories) {
      await accumulateFiles(result, directory, resolvedDirectoryPath, filter, recursively)
    }
  }
}

function resolveFilter(config: Config): Filter {
  if (config.filter instanceof Function) {
    return config.filter as Filter
  }

  if (typeof config.filter === 'string') {
    const normalizedPattern: string = normalizePath(config.filter)

    return (file: string): boolean => {
      return isMatch(normalizePath(file), normalizedPattern)
    }
  }

  return () => true
}

export async function loadFiles(config: Config): Promise<LoadingResult> {
  const result: LoadingResult = []

  const filter = resolveFilter(config)
  await accumulateFiles(result, config.rootDirectory, '', filter, config.recursively)

  return result
}
