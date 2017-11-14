const Botkit = require('botkit');

if (!process.env.SLACK_API_TOKEN) {
    console.log('Error: Specify Slack access token in environment.');
    process.exit(1);
}

const controller = Botkit.slackbot({debug: false});

controller.spawn({
    token: process.env.SLACK_API_TOKEN
}).startRTM(function(err) {
    if (err) {
        throw new Error(err);
    }
});

module.exports = controller;
