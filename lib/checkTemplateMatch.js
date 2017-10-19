async function getIssueData() {
  const res = await context.github.repos.getContent(this.repo({
    path: '.github/ISSUE_TEMPLATE.md'
  }))

  return Buffer.from(res.data.content, 'base64').toString()
}

function checkTemplateMatch(body) {
  getIssueData().then(issueTemplate) => {
    const lines = issueTemplate.split("\n*")
    lines.forEach(line => {
      if (!body.includes(line)) {
        return false
      }
    })
    return true
  }
}

module.exports = checkTemplateMatch