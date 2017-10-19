const res = await context.github.repos.getContent(this.repo({
  path: '.github/ISSUE_TEMPLATE.md'
}))

const issueTemplate = Buffer.from(res.data.content, 'base64').toString()