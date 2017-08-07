module.exports = robot => {
    robot.on('pull_request.opened', receive);
    robot.on('issues.opened', receive);
    async function receive(context) {
        let title;
        let body;
        let badTitle;
        if (context.payload.pull_request) {
            ({title, body} = context.payload.pull_request);
        } else {
            ({title, body} = context.payload.issue);
        }

        try {
            const config = await context.config('config.yml');
            if (config.requestInfoDefaultTitles) {
                if (config.requestInfoDefaultTitles.includes(title.toLowerCase())) {
                    badTitle = true;
                }
            }
            if (!body || badTitle) {
                context.github.issues.createComment(context.issue({body: config.requestInfoReplyComment}));
                if (config.requestInfoLabelToAdd) {
                    // Add label if there is one listed in the yaml file
                    context.github.issues.addLabels(context.issue({labels: [config.requestInfoLabelToAdd]}));
                }
            }
        } catch (err) {
            if (err.code !== 404) {
                throw err;
            }
        }
    }
};
