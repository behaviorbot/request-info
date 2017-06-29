module.exports = robot => {
    robot.on('pull_request.opened', receive);
    robot.on('issues.opened', receive);
    async function receive(context) {
        const title = context.payload.issue.title;
        const body = context.payload.issue.body;
        // robot.log('Title: ', title, 'Body: ', body);

        // Add options for if there is a default title?

        if (!body) {
            const options = context.repo({path: '.github/request-info.md'});
            const response = await context.github.repos.getContent(options);
            const template = Buffer.from(response.data.content, 'base64').toString();

            context.github.issues.createComment(context.issue({body: template}));
        }
    }
};
