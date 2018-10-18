const getComment = require('./lib/getComment')
const defaultConfig = require('./lib/defaultConfig')
const PullRequestBodyChecker = require('./lib/PullRequestBodyChecker')
const IssueBodyChecker = require('./lib/IssueBodyChecker')
const getConfig = require('probot-config')

module.exports = app => {
  app.on('installation_repositories.added', learningLabWelcome)
  app.on(['pull_request.opened', 'issues.opened'], receive)
  async function receive (context) {
    let title
    let body
    let badTitle
    let badBody
    let user

    let eventSrc = 'issue'
    if (context.payload.pull_request) {
      ({title, body, user} = context.payload.pull_request)
      eventSrc = 'pullRequest'
    } else {
      ({title, body, user} = context.payload.issue)
    }

    try {
      const config = await getConfig(context, 'config.yml', defaultConfig)

      if (!config.requestInfoOn[eventSrc]) {
        return
      }

      if (config.requestInfoDefaultTitles) {
        if (config.requestInfoDefaultTitles.includes(title.toLowerCase())) {
          badTitle = true
        }
      }

      if (eventSrc === 'pullRequest') {
        if (config.checkPullRequestTemplate && !(await PullRequestBodyChecker.isBodyValid(body, context))) {
          badBody = true
        }
      } else if (eventSrc === 'issue') {
        if (config.checkIssueTemplate && !(await IssueBodyChecker.isBodyValid(body, context))) {
          badBody = true
        }
      }

      let notExcludedUser = true
      if (config.requestInfoUserstoExclude) {
        if (config.requestInfoUserstoExclude.includes(user.login)) {
          notExcludedUser = false
        }
      }
      if ((!body || badTitle || badBody) && notExcludedUser) {
        const comment = getComment(config.requestInfoReplyComment, defaultConfig.requestInfoReplyComment)
        context.github.issues.createComment(context.issue({body: comment}))

        if (config.requestInfoLabelToAdd) {
          // Add label if there is one listed in the yaml file
          context.github.issues.addLabels(context.issue({labels: [config.requestInfoLabelToAdd]}))
        }
      }
    } catch (err) {
      if (err.code !== 404) {
        throw err
      }
    }
  }

  // Say hi!
  const NAME = 'introduction-to-github-apps'
  async function learningLabWelcome (context) {
    const includes = context.payload.repositories_added.some(r => r.name === NAME)
    if (!includes) return

    return context.github.issues.createComment({
      owner: context.payload.installation.account.login,
      repo: NAME,
      number: 2,
      body: 'Well done! You successfully installed the request info app.\n\n_disclaimer_ If you use this app in future repos, you won\'t get a message like this. This is just for Learning Lab!'
    })
  }
}
