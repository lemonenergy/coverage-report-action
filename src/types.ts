type CoverageJsonProperties = {
  statements: {
    covered: number
    total: number
    pct: number
  }
  branches: {
    covered: number
    total: number
    pct: number
  }
  functions: {
    covered: number
    total: number
    pct: number
  }
  lines: {
    covered: number
    total: number
    pct: number
  }
}

export type CoverageJson = {
  total: CoverageJsonProperties
  [file: string]: CoverageJsonProperties
}
