const res = await context.github.repos.getContent(this.repo({
  path: '.github/ISSUE_TEMPLATE.md'
}))

const issueTemplate = Buffer.from(res.data.content, 'base64').toString()

function checkTemplateMatch(body) {
  const lines = issueTemplate.split("\n*")
  lines.forEach(line => {
    if (!body.includes(line)) {
      return false
    }
  })
  return true
}

module.exports = checkTemplateMatch