function fromBase64 (content) {
  return Buffer.from(content, 'base64').toString()
}

async function getIssueTemplateBody (context, path) {
  try {
    const singleTemplate = await context.github.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path
    })

    return fromBase64(singleTemplate.data.content)
  } catch (err) {
    return null
  }
}

async function getIssueTemplatePaths (context) {
  try {
    const templatesDirectory = await context.github.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path: '.github/ISSUE_TEMPLATE/'
    })

    return templatesDirectory.data.map(f => f.path)
  } catch (err) {
    return null
  }
}

async function getIssueTemplates (context) {
  const defaultTemplate = await getIssueTemplateBody(context, '.github/ISSUE_TEMPLATE.md')
  if (defaultTemplate !== null) {
    return [defaultTemplate]
  }

  const paths = await getIssueTemplatePaths(context)
  if (paths !== null) {
    const templates = []
    for (const path of paths) {
      const template = await getIssueTemplateBody(context, path)
      if (template != null) {
        templates.push(template)
      }
    }

    return templates
  }

  return []
}

async function isBodyEqualToTemplate (body, context) {
  const issueTemplates = await getIssueTemplates(context)

  for (const template of issueTemplates) {
    if (body.includes(template)) {
      return true
    }
  }

  return false
}

class IssueBodyChecker {
  static async isBodyValid (body, config, context) {
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
