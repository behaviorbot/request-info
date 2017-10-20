async function getIssueData() {
  const res = await context.github.repos.getContent(this.repo({
    path: '.github/ISSUE_TEMPLATE.md'
  }))

  return Buffer.from(res.data.content, 'base64').toString()
}

function checkTemplateMatch(body) {
  getIssueData().then(issueTemplate => {
    return body.includes(issueTemplate)
  })
}

module.exports = checkTemplateMatch