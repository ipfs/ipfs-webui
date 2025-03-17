#!/usr/bin/env node
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)

// Files to ignore (won't be validated for kebab-case)
// This can be configured by modifying this list directly in the code
const IGNORED_FILES = [
  '.gitignore',
  '.npmignore',
  '.npmrc',
  '.nvmrc',
  '.aegir.js',
  '.editorconfig',
  '.github/CODEOWNERS',
  '.github/ISSUE_TEMPLATE/*',
  'README.md',
  'public/locales/README.md',
  'LICENSE',
  'CHANGELOG.md',
  'docs/LOCALIZATION.md',
  '@types/**',
  '*.d.ts',
  'public/locales/*/*',
  'patches/**',
  'test/e2e/fixtures/explore/blocks/*'
  // Add more files or patterns as needed
]

/**
 * Returns true if the provided string is in kebab-case.
 * Allowed characters: lowercase letters and digits; words separated by single hyphens.
 * @param {string} str
 * @returns {boolean}
 */
export function isKebabCase (str) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str)
}

/**
 * Validates a single path segment.
 * For segments with an extension (e.g. "my-file.js"), checks the basename using isKebabCase,
 * and then verifies that each extension part is lowercase alphanumeric.
 * Config files starting with "." are allowed.
 * Scoped packages starting with "@" are allowed.
 *
 * @param {string} segment
 * @returns {boolean}
 */
export function validateSegment (segment) {
  // Allow configuration files (files starting with a dot)
  if (segment.startsWith('.')) {
    const nameAfterDot = segment.substring(1)

    // Empty segment after dot is not valid
    if (nameAfterDot.length === 0) return false

    // If it has additional extensions, validate them
    const parts = nameAfterDot.split('.')

    // Validate the part after the dot
    if (!isKebabCase(parts[0])) return false

    // If there are extension parts, each must be lowercase alphanumeric
    for (let i = 1; i < parts.length; i++) {
      if (!/^[a-z0-9]+$/.test(parts[i])) return false
    }

    return true
  }

  // Allow npm scoped packages (segments starting with @)
  if (segment.startsWith('@')) {
    const nameAfterAt = segment.substring(1)

    // Empty segment after @ is not valid
    if (nameAfterAt.length === 0) return false

    // For scoped packages, the name after @ should be kebab-case
    return isKebabCase(nameAfterAt)
  }

  // For regular files, apply the original validation
  const parts = segment.split('.')
  const baseName = parts[0]
  if (!isKebabCase(baseName)) return false

  // If there are extension parts, each must be lowercase alphanumeric.
  for (let i = 1; i < parts.length; i++) {
    if (!/^[a-z0-9]+$/.test(parts[i])) return false
  }

  return true
}

/**
 * Validates an entire file path.
 * Splits the path by '/' and checks that every segment (folder or filename)
 * conforms to kebab-case rules.
 *
 * @param {string} filePath
 * @returns {boolean}
 */
export function validateFilePath (filePath) {
  const segments = filePath.split('/')
  return segments.every(segment => validateSegment(segment))
}

/**
 * Main function that fetches the list of Git-tracked files and validates each one.
 * Exits with code 1 if any invalid files are found.
 */
async function main () {
  try {
    const { stdout, stderr } = await execAsync('git ls-files')
    if (stderr) {
      console.error('Error running git ls-files:', stderr)
      process.exit(1)
    }

    const files = stdout.split('\n').filter(Boolean)

    // Filter out files that should be ignored
    const filesToValidate = files.filter(file => {
      // Skip files that exactly match an entry in the ignore list
      if (IGNORED_FILES.includes(file)) return false

      // Skip files that match a glob pattern in the ignore list
      for (const pattern of IGNORED_FILES) {
        if (pattern.includes('*') && matchesGlob(file, pattern)) return false
      }

      return true
    })

    const invalidFiles = filesToValidate.filter(file => !validateFilePath(file))

    if (invalidFiles.length > 0) {
      console.error('The following files/folders are not in kebab-case:')
      invalidFiles.forEach(file => console.error(`- ${file}`))
      process.exit(1)
    } else {
      console.log('All files are in kebab-case.')
      process.exit(0)
    }
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

/**
 * More robust glob matching for file patterns
 * Supports wildcards in nested directories
 * @param {string} filePath - The file path to check
 * @param {string} pattern - The glob pattern to match against
 * @returns {boolean} - Whether the file matches the pattern
 */
function matchesGlob (filePath, pattern) {
  // Split both the file path and pattern into segments
  const fileSegments = filePath.split('/')
  const patternSegments = pattern.split('/')

  // If the pattern has more segments than the file path, it can't match
  if (patternSegments.length > fileSegments.length) {
    return false
  }

  // Check if the pattern ends with /** (meaning match all subdirectories)
  const isWildcardAllDirs = pattern.endsWith('/**')
  if (isWildcardAllDirs) {
    // Remove the last segment (the /**) from the pattern
    patternSegments.pop()

    // If the file path starts with the pattern (minus the /**), it's a match
    const basePattern = patternSegments.join('/')
    return filePath.startsWith(basePattern + '/')
  }

  // For each segment in the pattern, check if it matches the corresponding file segment
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const fileSegment = i < fileSegments.length ? fileSegments[i] : ''

    // If we're at the last pattern segment and it's *, match all remaining file segments
    if (i === patternSegments.length - 1 && patternSegment === '*') {
      return true
    }

    // Handle * wildcard in this segment
    if (patternSegment === '*') {
      // * matches any single segment
      continue
    } else if (patternSegment.includes('*')) {
      // Convert segment with * to regex
      const segmentRegex = new RegExp('^' + patternSegment.replace(/\*/g, '.*') + '$')
      if (!segmentRegex.test(fileSegment)) {
        return false
      }
    } else if (patternSegment !== fileSegment) {
      // Exact match required
      return false
    }
  }

  // If the pattern matches all segments of the file path, or if the pattern ends with /*
  // (in which case the file path can have more segments), it's a match
  return patternSegments.length === fileSegments.length ||
         (patternSegments.length > 0 && patternSegments[patternSegments.length - 1] === '*')
}

// When run directly, execute main.
if (process.argv[1].endsWith('check-kebab-case.js')) {
  main()
}
