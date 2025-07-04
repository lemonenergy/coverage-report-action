import * as core from '@actions/core'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { REPORT_TITLE } from './constants'
import { getChangedFiles } from './github.utils'
import type { CoverageJson } from './types'

const footNote = `> [!NOTE]
> This report was generated by [Coverage Report Action](https://github.com/lemonenergy/coverage-report-action).`

// This guarantees that a PR with only test files will still have coverage data.
// It also increase range of included files when there is a snapshot.
// Only works when tests/snapshots are on the same directory.
const simplifyPath = (path: string) => {
  // Mock for testing purposes.
  const testPath = process.env.VITEST ? '/home/runner/work/' : null

  let transformedPath = path
    .replace(testPath ?? process.cwd(), '') // CI path
    .replace(/^\.\//, '') // Relative path

  // Target file for coverage from snapshots paths.
  //    i.e.: src/Example/__snapshots__/index.test.tsx.snap > src/Example
  if (transformedPath.endsWith('.snap'))
    transformedPath = transformedPath.replace(/\/__snapshots__\/.*$/, '') // Remove everything after `__snapshots__/`

  // Target file for coverage from test files paths.
  //    i.e.: src/Example/index.test.tsx > src/Example/index.tsx
  if (transformedPath.includes('.test.'))
    transformedPath = transformedPath.replace(/\.test\./, '.') // Replace `.test.` with `.`

  return transformedPath
}

const getJsonCoverage = (path: string) => {
  try {
    const workspacePath = process.env.GITHUB_WORKSPACE || process.cwd()
    const resolvedPath = resolve(workspacePath, path)

    core.info(`Looking for coverage file at: ${resolvedPath}`)

    const coverage = JSON.parse(readFileSync(resolvedPath, 'utf8'))

    if (!coverage.total) {
      core.error('No total coverage data found.')
      return null
    }

    return coverage as CoverageJson
  } catch (error) {
    core.error(error instanceof Error ? error.message : String(error), {
      title: 'Error reading coverage file:'
    })
    return null
  }
}

const makeToggleMarkdown = (
  title: string,
  content: string
) => `<details><summary><strong>${title}</strong></summary>

<br />

${content}

</details>\n\n`

const formatCoverage = (pct: number) => {
  if (pct >= 90) return `${pct}% 🔵` // Green for >= 95%
  if (pct >= 85) return `${pct}% 🟢` // Blue for >= 85%
  if (pct >= 70) return `${pct}% 🟡` // Yellow for >= 75%
  if (pct >= 50) return `${pct}% 🟠` // Orange for >= 50%
  return `${pct}% 🔴` // Red for < 50%
}

const makeCoverageMarkdown = (coverage: CoverageJson, paths?: string[]) => {
  let report = `## ${REPORT_TITLE}\n\n`

  report += '### Overall coverage\n\n'

  const { total, ...files } = coverage

  report += '| Metric     | Covered/Total | Status |\n'
  report += '| ---------- | ---------- | ---------- |\n'
  report += `| Statements  | ${total.statements.covered}/${total.statements.total} | ${formatCoverage(total.statements.pct)} |\n`
  report += `| Branches    | ${total.branches.covered}/${total.branches.total} | ${formatCoverage(total.branches.pct)} |\n`
  report += `| Functions   | ${total.functions.covered}/${total.functions.total} | ${formatCoverage(total.functions.pct)} |\n`
  report += `| Lines       | ${total.lines.covered}/${total.lines.total} | ${formatCoverage(total.lines.pct)} |\n\n`

  const filesCoverageLinesData = Object.entries(files)
    .filter(([file]) => !!paths?.find((it) => file.includes(simplifyPath(it))))
    .map(([file, data]) => ({
      ...data,
      path: file
    }))

  report += '### Diff coverage report\n\n'

  if (filesCoverageLinesData.length <= 0) {
    report += 'No files found with coverage data.\n\n'
    report += footNote
    return report
  }

  let coverageRender: string = ''

  coverageRender += '| File | Lines | Coverage Status |\n'
  coverageRender += '| ----- | ----- | ----- |\n'

  filesCoverageLinesData.forEach((file) => {
    coverageRender += `| ${simplifyPath(file.path)} | ${file.lines.covered}/${file.lines.total} | ${formatCoverage(file.lines.pct)} |\n`
  })

  if (filesCoverageLinesData.length > 10) {
    core.info(
      'More than 10 files with coverage data found. Report will be done inside a toggle.'
    )
    report += makeToggleMarkdown('Coverage by file', coverageRender)
  } else {
    coverageRender += '\n'
    report += coverageRender
  }

  report += footNote

  return report
}

export const generateCoverageReport = async (path: string, token?: string) => {
  const jsonCoverage = getJsonCoverage(path)

  if (!jsonCoverage)
    throw new Error(`No coverage json data found on path ${path}`)

  const diffFilesPaths = await getChangedFiles(token)

  const report = makeCoverageMarkdown(jsonCoverage, diffFilesPaths)

  core.info('Coverage report generated successfully.')

  const dirPath = './coverage-report-action-output'
  const filePath = `${dirPath}/coverage-report.md`

  mkdirSync(dirPath, { recursive: true })
  writeFileSync(filePath, report, 'utf8')

  return {
    filePath,
    report
  }
}
