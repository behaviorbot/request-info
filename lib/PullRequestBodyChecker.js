async function getPullRequestTemplate (context) {
  const result = await context.github.repos.getContent({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    path: '.github/PULL_REQUEST_TEMPLATE.md'
  })

  return Buffer.from(result.data.content, 'base64').toString()
}

async function isBodyEqualToTemplate (body, context) {
  const bodyTemplate = await getPullRequestTemplate(context)
  return body.includes(bodyTemplate)
}

class PullRequestBodyChecker {
  static async isBodyValid (body, config, context) {
    if (!body) {
      return false
    }

    if (config.checkPullRequestTemplate && await isBodyEqualToTemplate(body, context)) {
      return false
    }

    return true
  }
}

module.exports = PullRequestBodyChecker
