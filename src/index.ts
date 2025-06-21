import { getInput, info, setFailed } from '@actions/core'
import { exec } from '@actions/exec'
import { context } from '@actions/github'

const run = async () => {
  try {
    info('Release action started...')

    const githubToken = getInput('github-token')

    await exec('git', [
      'config',
      '--global',
      'user.email',
      '"github-actions[bot]@users.noreply.github.com"'
    ])
    await exec('git', [
      'config',
      '--global',
      'user.name',
      '"github-actions[bot]"'
    ])

    await exec('git', [
      'remote',
      'set-url',
      'origin',
      `https://x-access-token:${githubToken}@github.com/${context.repo.owner}/${context.repo.repo}.git`
    ])

    info('Release git config completed...')

    info('TODO: Implement the release logic here...')
  } catch (error) {
    setFailed(
      error instanceof Error ? error.message : `Unknown error: ${error}`
    )
  }
}

run()
