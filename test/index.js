const expect = require('expect');
const yaml = require('js-yaml');
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
                        content: Buffer.from(`labelToAdd: needs-more-info`).toString('base64')
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
                path: '.github/request-info.yml'
            });

            expect(github.repos.getContent).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                path: '.github/request-info.md'
            });

            expect(github.issues.createComment).toHaveBeenCalled();
            expect(github.issues.addLabels).toHaveBeenCalled();
        });
    });

    describe('new-pr-welcome fail', () => {
        beforeEach(() => {
            github.repos.getContent = expect.createSpy().andReturn(Promise.resolve({
                data: {
                    content: Buffer.from(` `).toString('base64')
                }
            }));
        });

        it('does not post a comment because it is not the user\'s first PR', async () => {
            await robot.receive(failEvent);

            expect(github.repos.getContent).toHaveBeenCalledWith({
                owner: 'hiimbex',
                repo: 'testing-things',
                path: '.github/request-info.yml'
            });

            expect(github.issues.createComment).toNotHaveBeenCalled();
            expect(github.issues.addLabels).toNotHaveBeenCalled();
        });
    });
});
