const expect = require('expect')
const {createRobot} = require('probot')
const plugin = require('..')
const issueSuccessEvent = require('./events/issueSuccessEvent')
const issueFailEvent = require('./events/issueFailEvent')
const prSuccessEvent = require('./events/prSuccessEvent')
const prFailEvent = require('./events/prFailEvent')

describe('Request info on both issues and pull requests', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from(`requestInfoLabelToAdd: needs-more-info\nrequestInfoDefaultTitles:\n  - readme.md\nrequestInfoReplyComment: >\n  Reply comment`).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy(),
        addLabels: expect.createSpy()
      }
    }
    robot.auth = () => Promise.resolve(github)
  })

  describe('Posts a comment because...', () => {
    it('there wasn\'t enough info provided in an issue', async () => {
      await robot.receive(issueSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toHaveBeenCalled()
      expect(github.issues.addLabels).toHaveBeenCalled()
    })
  })

  describe('Posts a comment because...', () => {
    it('there wasn\'t enough info provided in a pull request', async () => {
      await robot.receive(prSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toHaveBeenCalled()
      expect(github.issues.addLabels).toHaveBeenCalled()
    })
  })

  describe('Does not post a comment because...', () => {
    it('there was a body in issue', async () => {
      await robot.receive(issueFailEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toNotHaveBeenCalled()
      expect(github.issues.addLabels).toNotHaveBeenCalled()
    })
  })
})

describe('Request info disabled for issues', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from(`requestInfoLabelToAdd: needs-more-info\nrequestInfoDefaultTitles:\n  - readme.md\nrequestInfoReplyComment: >\n  Reply comment\nrequestInfoOn:\n issue: false\n pullRequest: true\n`).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy(),
        addLabels: expect.createSpy()
      }
    }
    robot.auth = () => Promise.resolve(github)
  })

  describe('Does not post a comment because...', () => {
    it("'issue' type is disabled even if there wasn't enough info provided", async () => {
      await robot.receive(issueSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toNotHaveBeenCalled()
      expect(github.issues.addLabels).toNotHaveBeenCalled()
    })
  })

  describe('Does not post a comment because...', () => {
    it('there was a body in issue', async () => {
      await robot.receive(issueFailEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toNotHaveBeenCalled()
      expect(github.issues.addLabels).toNotHaveBeenCalled()
    })
  })

  describe('Posts a comment because...', () => {
    it('there wasn\'t enough info provided in a pull request', async () => {
      await robot.receive(prSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toHaveBeenCalled()
      expect(github.issues.addLabels).toHaveBeenCalled()
    })
  })
})

describe('Request info disabled for pull requests', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        getContent: expect.createSpy().andReturn(Promise.resolve({
          data: {
            content: Buffer.from(`requestInfoLabelToAdd: needs-more-info\nrequestInfoDefaultTitles:\n  - readme.md\nrequestInfoReplyComment: >\n  Reply comment\nrequestInfoOn:\n issue: true\n pullRequest: false\n`).toString('base64')
          }
        }))
      },
      issues: {
        createComment: expect.createSpy(),
        addLabels: expect.createSpy()
      }
    }
    robot.auth = () => Promise.resolve(github)
  })

  describe('Does not post a comment because...', () => {
    it("'pullRequest' type is disabled even if there wasn't enough info provided", async () => {
      await robot.receive(prSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toNotHaveBeenCalled()
      expect(github.issues.addLabels).toNotHaveBeenCalled()
    })
  })

  describe('Does not post a comment because...', () => {
    it('there was a body in pr', async () => {
      await robot.receive(prFailEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toNotHaveBeenCalled()
      expect(github.issues.addLabels).toNotHaveBeenCalled()
    })
  })

  describe('Posts a comment because...', () => {
    it('there wasn\'t enough info provided (issue type still working)', async () => {
      await robot.receive(issueSuccessEvent)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'hiimbex',
        repo: 'testing-things',
        path: '.github/config.yml'
      })

      expect(github.issues.createComment).toHaveBeenCalled()
      expect(github.issues.addLabels).toHaveBeenCalled()
    })
  })
})
