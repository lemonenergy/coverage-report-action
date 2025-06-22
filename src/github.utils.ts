import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { readFileSync } from 'fs'
import { REPORT_TITLE } from './constants'

export const getChangedFiles = async (token?: string): Promise<string[]> => {
  if (!token) throw new Error('GitHub token is required')

  const octokit = getOctokit(token)

  const pullRequest = context.payload.pull_request

  if (!pullRequest)
    throw new Error('This action should only run on pull requests')

  const owner = context.repo.owner
  const repo = context.repo.repo
  const prNumber = pullRequest.number

  try {
    core.info(`Getting changed files for PR #${prNumber}`)

    // Get the list of files changed in the PR
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      per_page: 100,
      pull_number: prNumber,
      repo
    })

    const changedFilePaths = files.map((file) => file.filename)

    core.info(`Found ${changedFilePaths.length} changed files`)
    core.debug(`Changed files: ${changedFilePaths.join(', ')}`)

    return changedFilePaths
  } catch (error) {
    core.setFailed(
      `Failed to get changed files: ${error instanceof Error ? error.message : String(error)}`
    )
    return []
  }
}

export const updateCoverageComment = async (
  coverageMdPath: string,
  token?: string
) => {
  if (!token) throw new Error('GitHub token is required')

  const octokit = getOctokit(token)

  const pullRequest = context.payload.pull_request

  if (!pullRequest)
    throw new Error('This action should only run on pull requests')

  const owner = context.repo.owner
  const repo = context.repo.repo
  const prNumber = pullRequest.number

  const coverageReport = readFileSync(coverageMdPath, 'utf-8')

  try {
    // Check for existing comments by the bot
    const { data: comments } = await octokit.rest.issues.listComments({
      issue_number: prNumber,
      owner,
      repo
    })

    const coverageBotComment = comments.find(
      (comment) =>
        comment.user?.login === 'github-actions[bot]' &&
        comment.body?.includes(REPORT_TITLE)
    )

    if (coverageBotComment) {
      // Remove the existing comment to replace with a new one
      core.info(
        `Removing existing coverage comment with ID ${coverageBotComment.id}`
      )
      await octokit.rest.issues.deleteComment({
        comment_id: coverageBotComment.id,
        owner,
        repo
      })
    }

    await octokit.rest.issues.createComment({
      body: coverageReport,
      issue_number: prNumber,
      owner,
      repo
    })

    core.info('Coverage report comment upserted successfully.')
  } catch (error) {
    core.setFailed(
      `Failed to upsert coverage comment: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
