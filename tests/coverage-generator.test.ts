import { rmSync } from 'fs'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { generateCoverageReport } from '../src/coverage-generator'
import { getChangedFiles } from '../src/github.utils'

const dummyCoveragePath = 'tests/fixtures/coverage-summary.json'

vi.mock('../src/github.utils', () => ({
  getChangedFiles: vi.fn(() => Promise.resolve([]))
}))

vi.mock('@actions/core')

describe('generateCoverageReport()', () => {
  it('should throw if the coverage json is not found in path', async () => {
    const fakePath = 'fakepath/coverage-summary.json'
    const fn = generateCoverageReport(fakePath, '')

    await expect(fn).rejects.toThrow(
      `No coverage json data found on path ${fakePath}`
    )
  })

  it('should generate the coverage successfully when there is no coverage for diff', async () => {
    const { filePath, report } = await generateCoverageReport(
      dummyCoveragePath,
      ''
    )

    expect(filePath).toBe('./coverage-report-action-output/coverage-report.md')
    expect(report).toContain('No files found with coverage data.')
    expect(report).toMatchSnapshot()
  })

  it('should generate the coverage successfully when there is coverage for diff', async () => {
    vi.mocked(getChangedFiles).mockResolvedValueOnce([
      'src/index.ts',
      'src/green.ts',
      'src/yellow.ts',
      'src/orange.ts',
      'src/red.ts'
    ])

    const { filePath, report } = await generateCoverageReport(
      dummyCoveragePath,
      ''
    )

    expect(filePath).toBe('./coverage-report-action-output/coverage-report.md')
    expect(report).toContain('| src/index.ts | 10/10 | 100% 🔵 |')
    expect(report).toContain('| src/green.ts | 88/100 | 88% 🟢 |')
    expect(report).toContain('| src/yellow.ts | 77/100 | 77% 🟡 |')
    expect(report).toContain('| src/orange.ts | 58/100 | 58% 🟠 |')
    expect(report).toContain('| src/red.ts | 45/100 | 45% 🔴 |')
    expect(report).toMatchSnapshot()
  })

  it('should generate the coverage successfully when there is coverage for diff and more than 10 files', async () => {
    vi.mocked(getChangedFiles).mockResolvedValueOnce([
      'src/index.ts',
      'src/green.ts',
      'src/yellow.ts',
      'src/orange.ts',
      'src/red.ts',
      'src/dummy1.ts',
      'src/dummy2.ts',
      'src/dummy3.ts',
      'src/dummy4.ts',
      'src/dummy5.ts',
      'src/dummy6.ts'
    ])

    const { filePath, report } = await generateCoverageReport(
      dummyCoveragePath,
      ''
    )

    expect(filePath).toBe('./coverage-report-action-output/coverage-report.md')
    expect(report)
      .toContain(`<details><summary><strong>Coverage by file</strong></summary>

<br />

| File | Lines | Coverage Status |
| ----- | ----- | ----- |
| src/index.ts | 10/10 | 100% 🔵 |
| src/green.ts | 88/100 | 88% 🟢 |
| src/yellow.ts | 77/100 | 77% 🟡 |
| src/orange.ts | 58/100 | 58% 🟠 |
| src/red.ts | 45/100 | 45% 🔴 |
| src/dummy1.ts | 1/1 | 100% 🔵 |
| src/dummy2.ts | 1/1 | 100% 🔵 |
| src/dummy3.ts | 1/1 | 100% 🔵 |
| src/dummy4.ts | 1/1 | 100% 🔵 |
| src/dummy5.ts | 1/1 | 100% 🔵 |
| src/dummy6.ts | 1/1 | 100% 🔵 |


</details>`)
    expect(report).toMatchSnapshot()
  })

  afterAll(() => {
    // Remove the local generated `coverage-report-action-output` directory
    rmSync('./coverage-report-action-output', { force: true, recursive: true })
  })
})
