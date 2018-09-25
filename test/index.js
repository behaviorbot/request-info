const expect = require('expect')
const {createRobot} = require('probot')
const plugin = require('..')
const issueSuccessEvent = require('./events/issueSuccessEvent')
const issueFailEvent = require('./events/issueFailEvent')
const prSuccessEvent = require('./events/prSuccessEvent')
const prFailEvent = require('./events/prFailEvent')
const prTemplateBodyEvent = require('./events/prTemplateBodyEvent')
const issueTemplateBodyEvent = require('./events/issueTemplateBodyEvent.json')
const issueFirstTemplateBodyEvent = require('./events/issueFirstTemplateBodyEvent.json')
const issueSecondTemplateBodyEvent = require('./events/issueSecondTemplateBodyEvent.json')

describe('Request info', () => {
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

  describe('Request info on both issues and pull requests', () => {
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
    beforeEach(() => {
      github.repos.getContent.andReturn(Promise.resolve({
        data: {
          content: Buffer.from(`requestInfoLabelToAdd: needs-more-info\nrequestInfoDefaultTitles:\n  - readme.md\nrequestInfoReplyComment: >\n  Reply comment\nrequestInfoOn:\n issue: false\n pullRequest: true\n`).toString('base64')
        }
      }))
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
    beforeEach(() => {
      github.repos.getContent.andReturn(Promise.resolve({
        data: {
          content: Buffer.from(`requestInfoLabelToAdd: needs-more-info\nrequestInfoDefaultTitles:\n  - readme.md\nrequestInfoReplyComment: >\n  Reply comment\nrequestInfoOn:\n issue: true\n pullRequest: false\n`).toString('base64')
        }
      }))
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

  describe('Request info for random comment', () => {
    beforeEach(() => {
      github.repos.getContent.andReturn(Promise.resolve({
        data: {
          content: Buffer.from(`requestInfoReplyComment:\n  - Reply comment\n  - Other reply comment`).toString('base64')
        }
      }))
    })

    describe('Posts a random comment', () => {
      it('selects a random comment and posts it', async () => {
        await robot.receive(prSuccessEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toHaveBeenCalled()
        expect(github.issues.addLabels).toNotHaveBeenCalled()
      })
    })
  })

  describe('Request info for excluded user', () => {
    beforeEach(() => {
      github.repos.getContent.andReturn(Promise.resolve({
        data: {
          content: Buffer.from(`requestInfoUserstoExclude:\n  - hiimbex\n  - bexo`).toString('base64')
        }
      }))
    })

    describe('Posts a random comment', () => {
      it('selects a random comment and posts it', async () => {
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
  })

  describe('Request info based on Pull Request template', () => {
    describe('If the setting is set to true', () => {
      beforeEach(() => {
        github.repos.getContent.andCall(({path}) => {
          if (path === '.github/PULL_REQUEST_TEMPLATE.md') {
            return Promise.resolve({
              data: {
                content: Buffer.from('This is a PR template, please update me')
              }
            })
          }

          return Promise.resolve({
            data: {
              content: Buffer.from(`checkPullRequestTemplate: true`).toString('base64')
            }
          })
        })
      })

      it('Posts a comment when PR body is equal to template', async () => {
        await robot.receive(prTemplateBodyEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toHaveBeenCalled()
      })

      it('Does not post a comment when PR body is different from template', async () => {
        await robot.receive(prFailEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toNotHaveBeenCalled()
      })
    })

    describe('If the setting is set to false', () => {
      beforeEach(() => {
        github.repos.getContent.andCall(({path}) => {
          if (path === '.github/PULL_REQUEST_TEMPLATE.md') {
            return Promise.resolve({
              data: {
                content: Buffer.from('This is a PR template, please update me')
              }
            })
          }

          return Promise.resolve({
            data: {
              content: Buffer.from(`checkPullRequestTemplate: false`).toString('base64')
            }
          })
        })
      })

      it('Does not post a comment when PR body is equal to template', async () => {
        await robot.receive(prTemplateBodyEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toNotHaveBeenCalled()
      })

      it('Does not post a comment when PR body is different from template', async () => {
        await robot.receive(prFailEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toNotHaveBeenCalled()
      })
    })
  })

  describe('Request info based on issue template', () => {
    describe('If the setting is set to false', () => {
      beforeEach(() => {
        github.repos.getContent.andCall(({path}) => {
          return Promise.resolve({
            data: {
              content: Buffer.from(`checkIssueTemplate: false`).toString('base64')
            }
          })
        })
      })

      it('posts a message when issue body is empty', async () => {
        await robot.receive(issueSuccessEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toHaveBeenCalled()
      })

      it('does not post a message when PR body has text', async () => {
        await robot.receive(issueFailEvent)

        expect(github.repos.getContent).toHaveBeenCalledWith({
          owner: 'hiimbex',
          repo: 'testing-things',
          path: '.github/config.yml'
        })

        expect(github.issues.createComment).toNotHaveBeenCalled()
      })
    })

    describe('If the setting is set to true', () => {
      describe('And the user has no issue template defined', () => {
        beforeEach(() => {
          github.repos.getContent.andCall(({path}) => {
            if (path === '.github/ISSUE_TEMPLATE.md') {
              return Promise.reject(new Error('404'))
            }

            return Promise.resolve({
              data: {
                content: Buffer.from(`checkIssueTemplate: false`).toString('base64')
              }
            })
          })
        })

        it('posts a message when issue body is empty', async () => {
          await robot.receive(issueSuccessEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('does not post a message when PR body has text', async () => {
          await robot.receive(issueFailEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toNotHaveBeenCalled()
        })
      })

      describe('And the user has one template defined', () => {
        beforeEach(() => {
          github.repos.getContent.andCall(({path}) => {
            if (path === '.github/ISSUE_TEMPLATE.md') {
              return Promise.resolve({
                data: {
                  content: Buffer.from('This is an issue template, please update me').toString('base64')
                }
              })
            }

            return Promise.resolve({
              data: {
                content: Buffer.from(`checkIssueTemplate: true`).toString('base64')
              }
            })
          })
        })

        it('posts a message when issue body is empty', async () => {
          await robot.receive(issueSuccessEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('posts a message when issue body matches template', async () => {
          await robot.receive(issueTemplateBodyEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('does not post a message when issue body is different to template', async () => {
          await robot.receive(issueFailEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toNotHaveBeenCalled()
        })
      })

      describe('And the user has multiple templates defined', () => {
        beforeEach(() => {
          github.repos.getContent.andCall(({path}) => {
            if (path === '.github/ISSUE_TEMPLATE.md') {
              return Promise.reject(new Error('404'))
            }

            if (path === '.github/ISSUE_TEMPLATE/') {
              return Promise.resolve({ data: [
                {
                  name: 'first-remplate.md',
                  path: '.github/ISSUE_TEMPLATE/first-template.md'
                },
                {
                  name: 'second-remplate.md',
                  path: '.github/ISSUE_TEMPLATE/second-template.md'
                }]
              })
            }

            if (path === '.github/ISSUE_TEMPLATE/first-template.md') {
              return Promise.resolve({
                data: {
                  content: Buffer.from('This is the first issue template, please update me').toString('base64')
                }
              })
            }

            if (path === '.github/ISSUE_TEMPLATE/second-template.md') {
              return Promise.resolve({
                data: {
                  content: Buffer.from('This is the second issue template, please update me').toString('base64')
                }
              })
            }

            if (path === '.github/config.yml') {
              return Promise.resolve({
                data: {
                  content: Buffer.from(`checkIssueTemplate: true`).toString('base64')
                }
              })
            }

            console.log(`querying path: ${path}`)

            return Promise.reject(`Unhandled code path requested: ${path}`)
          })
        })

        it('posts a message when issue body is empty', async () => {
          await robot.receive(issueSuccessEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('posts a message when issue body matches first template', async () => {
          await robot.receive(issueFirstTemplateBodyEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('posts a message when issue body matches second template', async () => {
          await robot.receive(issueSecondTemplateBodyEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toHaveBeenCalled()
        })

        it('does not post a message when issue body is different to all templates', async () => {
          await robot.receive(issueFailEvent)

          expect(github.repos.getContent).toHaveBeenCalledWith({
            owner: 'hiimbex',
            repo: 'testing-things',
            path: '.github/config.yml'
          })

          expect(github.issues.createComment).toNotHaveBeenCalled()
        })
      })
    })
  })
})
