const yaml = require('js-yaml');

module.exports = robot => {
    robot.on('pull_request.opened', receive);
    robot.on('issues.opened', receive);
    async function receive(context) {
        let title, body, number, bodies, badTitle;
        if (context.payload.pull_request) {
            ({ title, body, number } = context.payload.pull_request);
        } else {
            ({ title, body, number } = context.payload.issue);
        }

        try {
            const options = context.repo({path: '.github/config.yml'});
            const response = await context.github.repos.getContent(options);
            bodies = yaml.load(Buffer.from(response.data.content, 'base64').toString()) || {};
        } catch (err) {
            if (err.code !== 404) throw err;
        }

        if (bodies) {
            if (bodies.requestInfoDefaultTitles.includes(title.toLowerCase())) badTitle = true;
        }
        if (!body || badTitle) {
            context.github.issues.createComment(context.issue({body: bodies.requestInfoReplyComment}));
            if (bodies.requestInfoLabelToAdd) {
                // Add label if there is one listed in the yaml file
                const repo = context.payload.repository;
                context.github.issues.addLabels({
                    owner: repo.owner.login,
                    repo: repo.name,
                    number,
                    labels: [bodies.requestInfoLabelToAdd]
                });
            }
        }
    }
};
