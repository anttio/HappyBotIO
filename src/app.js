import HappyBot from './components/HappyBot';
import Kilometrikisa from './components/Kilometrikisa';

const kmkisa = new Kilometrikisa({
    username: process.env.KMKISA_USERNAME,
    password: process.env.KMKISA_PASSWORD,
    loginURL: process.env.KMKISA_LOGIN_URL,
    teamURL: process.env.KMKISA_TEAM_URL
});

HappyBot.hears(['kmkisa'], ['direct_message', 'direct_mention'], (bot, message) => {
    kmkisa.getTeamStatistics((statistics) => {
        bot.reply(message, {
            text: 'Your team is currently ranked at ' + statistics.team.ranking + ' and it has cycled ' + statistics.team.mileage + ' kilometers.',
            attachments: kmkisa.getMemberStatisticsForSlackBot(statistics.members)
        });
    });
});
