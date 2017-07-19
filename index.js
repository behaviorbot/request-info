const yaml = require('js-yaml');

module.exports = robot => {
    robot.on('pull_request.opened', receive);
    robot.on('issues.opened', receive);
    async function receive(context) {
        let title, body, config, badTitle;
        if (context.payload.pull_request) {
            ({ title, body } = context.payload.pull_request);
        } else {
            ({ title, body } = context.payload.issue);
        }

        try {
            const options = context.repo({path: '.github/config.yml'});
            const response = await context.github.repos.getContent(options);
            config = yaml.load(Buffer.from(response.data.content, 'base64').toString()) || {};
        } catch (err) {
            if (err.code !== 404) throw err;
        }

        if (config) {
            if (config.requestInfoDefaultTitles.includes(title.toLowerCase())) badTitle = true;
        }
        if (!body || badTitle) {
            context.github.issues.createComment(context.issue({body: config.requestInfoReplyComment}));
            if (config.requestInfoLabelToAdd) {
                // Add label if there is one listed in the yaml file
                context.github.issues.addLabels(context.issue({labels: [config.requestInfoLabelToAdd]}));
            }
        }
    }
};
