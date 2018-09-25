async function getIssueTemplates(context) {
  // TODO: check for single template
  const result = await context.github.repos.getContent({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    path: '.github/ISSUE_TEMPLATE.md'
  })
  // if found, return that
  // TODO: check for template folder
  // if found, return array of templates

  return Buffer.from(result.data.content, 'base64').toString()
}

async function isBodyEqualToTemplate(body, context) {
  const bodyTemplate = await getPullRequestTemplate(context)
  return body.includes(bodyTemplate)
}

class IssueBodyChecker {
  static async isBodyValid(body, config, context) {
    if (!body) {
      return false
    }

    if (config.checkIssueTemplate && (await isBodyEqualToTemplate(body, context))) {
      return false
    }

    return true
  }
}

module.exports = IssueBodyChecker
