const expect = require('expect');
const {createRobot} = require('probot');
const plugin = require('..');
const successEvent = require('./events/successEvent');
const failEvent = require('./events/failEvent');

describe('new-pr-welcome', () => {
    let robot;
    let github;

    beforeEach(() => {
        robot = createRobot();
        plugin(robot);

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
                addLabels : expect.createSpy()
            }
        };
        robot.auth = () => Promise.resolve(github);
    });

    describe('request-info', () => {
        it('posts a comment because there wasn\'t enough info provided', async () => {
            await robot.receive(successEvent);

            expect(github.repos.getContent).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                path: '.github/config.yml'
            });

            expect(github.issues.createComment).toHaveBeenCalled();
            expect(github.issues.addLabels).toHaveBeenCalled();
        });
    });

    describe('new-pr-welcome fail', () => {
        it('does not post a comment because it is not the user\'s first PR', async () => {
            await robot.receive(failEvent);

            expect(github.repos.getContent).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                path: '.github/config.yml'
            });

            expect(github.issues.createComment).toNotHaveBeenCalled();
            expect(github.issues.addLabels).toNotHaveBeenCalled();
        });
    });
});
