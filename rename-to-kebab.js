const fs = require('fs')
const path = require('path')

// Function to extract links from the README file
function extractLinksFromReadme () {
  try {
    const readmePath = path.join('.', 'README.md')
    if (!fs.existsSync(readmePath)) return []

    const content = fs.readFileSync(readmePath, 'utf8')

    // Match markdown links and image links with file extensions
    // This regex looks for [text](path) and ![text](path) patterns
    const linkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g

    const links = []
    let match

    while ((match = linkRegex.exec(content)) !== null) {
      const linkPath = match[2]
      // Only include local file links (not URLs)
      if (!linkPath.startsWith('http') && !linkPath.startsWith('#')) {
        // Normalize the path
        const normalizedPath = path.normalize(linkPath.split('#')[0].split('?')[0])
        links.push(normalizedPath)
      }
    }

    return links
  } catch (error) {
    console.error('Error extracting links from README:', error)
    return []
  }
}

// Function to convert file name to kebab-case
function toKebabCase (fileName) {
  // Get the base name and extension
  const ext = path.extname(fileName)
  const baseName = path.basename(fileName, ext)

  // Convert to kebab-case
  const kebabName = baseName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Convert PascalCase to kebab-case
    .toLowerCase()

  return kebabName + ext
}

// Function to check if a file needs renaming
function needsRenaming (fileName, excludedFiles) {
  const baseName = path.basename(fileName)

  // Skip files that should be excluded
  if (excludedFiles.includes(baseName)) {
    return false
  }

  const kebabName = toKebabCase(baseName)
  return baseName !== kebabName
}

// Function to recursively find all files that need renaming
function findFilesToRename (dir, filesToRename = [], ignoreDirs = ['.git', 'node_modules', 'build', 'dist', 'coverage'], excludedFiles = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      if (!ignoreDirs.includes(file.name)) {
        findFilesToRename(fullPath, filesToRename, ignoreDirs, excludedFiles)
      }
    } else if (needsRenaming(file.name, excludedFiles)) {
      filesToRename.push(fullPath)
    }
  }

  return filesToRename
}

// Function to create a rename map (old path -> new path)
function createRenameMap (filesToRename) {
  const renameMap = {}

  filesToRename.forEach(file => {
    const dir = path.dirname(file)
    const oldName = path.basename(file)
    const newName = toKebabCase(oldName)
    const newPath = path.join(dir, newName)

    renameMap[file] = newPath
  })

  return renameMap
}

// Function to find all JS/TS/JSX/TSX files
function findAllSourceFiles (dir, sourceFiles = [], ignoreDirs = ['.git', 'node_modules', 'build', 'dist', 'coverage']) {
  const files = fs.readdirSync(dir, { withFileTypes: true })

  for (const file of files) {
    const fullPath = path.join(dir, file.name)

    if (file.isDirectory()) {
      if (!ignoreDirs.includes(file.name)) {
        findAllSourceFiles(fullPath, sourceFiles, ignoreDirs)
      }
    } else {
      const ext = path.extname(file.name).toLowerCase()
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(ext)) {
        sourceFiles.push(fullPath)
      }
    }
  }

  return sourceFiles
}

// Function to update import statements in a file
function updateImportsInFile (filePath, renameMap) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let updatedContent = content

    // Create a mapping of old import paths to new import paths
    const importMap = {}

    for (const [oldPath, newPath] of Object.entries(renameMap)) {
      const oldRelativePath = path.relative(path.dirname(filePath), oldPath)
      const newRelativePath = path.relative(path.dirname(filePath), newPath)

      // Handle both quoted paths and extensions
      const oldImportPath = oldRelativePath.replace(/\\/g, '/') // Convert Windows path separators
      const newImportPath = newRelativePath.replace(/\\/g, '/')

      importMap[oldImportPath] = newImportPath

      // Also handle paths without extensions
      const oldNoExt = oldImportPath.replace(/\.[^/.]+$/, '')
      const newNoExt = newImportPath.replace(/\.[^/.]+$/, '')
      importMap[oldNoExt] = newNoExt
    }

    // Update import statements
    for (const [oldImport, newImport] of Object.entries(importMap)) {
      // Match both single and double quotes in imports
      const singleQuoteRegex = new RegExp(`from\\s*'(.*/)?${path.basename(oldImport)}'`, 'g')
      const doubleQuoteRegex = new RegExp(`from\\s*"(.*/)?${path.basename(oldImport)}"`, 'g')

      // Also match paths in require statements
      const requireSingleQuoteRegex = new RegExp(`require\\s*\\(\\s*'(.*/)?${path.basename(oldImport)}'\\s*\\)`, 'g')
      const requireDoubleQuoteRegex = new RegExp(`require\\s*\\(\\s*"(.*/)?${path.basename(oldImport)}"\\s*\\)`, 'g')

      // Replace the import paths
      updatedContent = updatedContent
        .replace(singleQuoteRegex, `from '${path.dirname(oldImport) === '.' ? '' : path.dirname(oldImport) + '/'}${path.basename(newImport)}'`)
        .replace(doubleQuoteRegex, `from "${path.dirname(oldImport) === '.' ? '' : path.dirname(oldImport) + '/'}${path.basename(newImport)}"`)
        .replace(requireSingleQuoteRegex, `require('${path.dirname(oldImport) === '.' ? '' : path.dirname(oldImport) + '/'}${path.basename(newImport)}')`)
        .replace(requireDoubleQuoteRegex, `require("${path.dirname(oldImport) === '.' ? '' : path.dirname(oldImport) + '/'}${path.basename(newImport)}")`)
    }

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`Updated imports in ${filePath}`)
    }
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error)
  }
}

// Main function
function main () {
  const rootDir = '.'

  // Standard files to exclude
  const standardExclusions = [
    'LICENSE', 'LICENSE.md', 'LICENSE.txt',
    'README.md', 'README.txt', 'README',
    'CHANGELOG.md', 'CONTRIBUTING.md',
    'package.json', 'package-lock.json',
    'yarn.lock', 'tsconfig.json',
    '.gitignore', '.editorconfig',
    // Script files
    'rename-to-kebab.js'
  ]

  // Extract links from README
  const readmeLinks = extractLinksFromReadme()
  console.log('Detected links in README.md that will be excluded from renaming:', readmeLinks)

  // All excluded files (standard + README links)
  const excludedFiles = [...standardExclusions, ...readmeLinks.map(link => path.basename(link))]

  const filesToRename = findFilesToRename(rootDir, [], ['.git', 'node_modules', 'build', 'dist', 'coverage'], excludedFiles)

  console.log(`Found ${filesToRename.length} files that need to be renamed to kebab-case:\n`)

  // Create rename map
  const renameMap = createRenameMap(filesToRename)

  // Display the files that will be renamed
  for (const [oldPath, newPath] of Object.entries(renameMap)) {
    console.log(`${oldPath} -> ${newPath}`)
  }

  // Confirm before proceeding
  console.log('\nWould you like to proceed with renaming these files? (y/n)')
  const response = 'n' // Default to 'n' for safety - change to process.stdin.read() in a real script

  // This is a dry run by default
  console.log('\nDRY RUN - No files will be renamed. To actually rename files, edit this script and set the "response" variable to "y" or implement proper stdin reading.')

  if (response.toLowerCase() === 'y') {
    // Find all source files
    const sourceFiles = findAllSourceFiles(rootDir)

    // Update imports in all source files
    for (const file of sourceFiles) {
      updateImportsInFile(file, renameMap)
    }

    // Rename files (do this after updating imports)
    for (const [oldPath, newPath] of Object.entries(renameMap)) {
      try {
        fs.renameSync(oldPath, newPath)
        console.log(`Renamed ${oldPath} to ${newPath}`)
      } catch (error) {
        console.error(`Error renaming ${oldPath} to ${newPath}:`, error)
      }
    }

    console.log('\nFile renaming complete!')
  }
}

main()
