const getComment = require('./lib/getComment')
const defaultConfig = require('./lib/defaultConfig')
const PullRequestBodyChecker = require('./lib/PullRequestBodyChecker')

module.exports = robot => {
  robot.on(['pull_request.opened', 'issues.opened', 'issues.labeled', 'pull_request.labeled'], receive)
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
      const config = await context.config('config.yml', defaultConfig)

      if (!config.requestInfoOn[eventSrc]) {
        return
      }

      if (config.requestInfoDefaultTitles) {
        if (config.requestInfoDefaultTitles.includes(title.toLowerCase())) {
          badTitle = true
        }
      }

      if (eventSrc === 'pullRequest') {
        if (!(await PullRequestBodyChecker.isBodyValid(body, config, context))) {
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
        const label = await context.github.issues.getIssueLabels(context.issue())
        const requestLabel = label.data.find(label => {
          return label.name === 'request-info'
        })
        if (requestLabel) {
          const comment = getComment(config.requestInfoReplyComment, defaultConfig.requestInfoReplyComment)
          context.github.issues.createComment(context.issue({body: comment}))
        }

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
}
