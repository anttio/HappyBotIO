const cheerio = require('cheerio');
const request = require('request').defaults({
  jar: true
});

export default class Kilometrikisa {

    constructor(props) {
      this._username = props.username;
      this._password = props.password;
      this._loginURL = props.loginURL;
      this._teamURL = props.teamURL;
    }

    /**
     * Get CSRF Middleware Token from the login page
     * @param  {Function} callback
     */
    _getCSRFMiddlewareToken(callback) {
      if (!this._loginURL) { return false; }

      request(this._loginURL, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(body);
          const token = $('[name="csrfmiddlewaretoken"]')[0].attribs.value;
          callback(token);
        }
      });

      return true;
    }

    /**
     * Log in for the Kilometrikisa web service
     * @param  {String}   csrfmiddlewaretoken
     * @param  {Function} callback
     */
    _logIn(token, callback) {
      if (!this._loginURL || !this._username || !this._password || !token) {
        return false;
      }

      request({
        url: this._loginURL,
        method: 'POST',
        form: {
          username: this._username,
          password: this._password,
          csrfmiddlewaretoken: token
        },
        headers: {
          referer: this._loginURL
        }
      }, (error) => {
        if (!error) { callback(); }
      });

      return true;
    }

    /**
     * Fetch team statistics from the Kilometrikisa team page
     * @param  {Function} callback
     */
    _fetchTeamStatistics(callback) {
      if (!this._teamURL) { return false; }

      let statistics = {};

      request(this._teamURL, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(body);

          const teamData = $('.team-contest-table').find('li');
          statistics.team = {
            ranking: teamData.eq(1).find('strong').text().trim(),
            mileage: teamData.eq(3).text().trim().replace(/^\D+/g, '').replace(' km', ''),
            days: teamData.eq(5).text().trim().replace(/^\D+/g, '')
          };

          const membersData = $('[data-slug="my-team"]').find('tbody tr');
          statistics.members = [];
          membersData.each((i, member) => {
            const cell = $(member).find('td');
            statistics.members.push([
              cell.eq(1).text().trim(),   // name
              cell.eq(2).text().trim(),   // kilometers
              cell.eq(3).text().trim()    // days
            ]);
          });

          callback(statistics);
        }
      });

      return true;
    }

    /**
     * Get team statistics
     * @param  {Function} callback
     * @return {Array}
     */
    getTeamStatistics(callback) {
      this._getCSRFMiddlewareToken((token) =>
          this._logIn(token, () =>
              this._fetchTeamStatistics((statistics) =>
                  callback(statistics)
              )
          )
      );
    }

    /**
     * Get formatted statistics for SlackBot attachment
     * @param  {Array} members
     * @return {Array}
     */
    getMemberStatisticsForSlackBot(members) {
      let attachments = [];

      for (let i = 0; i < members.length; i++) {
        var kilometers = parseFloat(members[i][1].replace(/\s/g, ''));
        console.log(kilometers);
        var days = parseInt(members[i][2]);
        var text = members[i][1].replace(',', '.') + ' km | ' + days + ' days';

        if (kilometers > 0 && days > 0) {
          text += ' | ' + (kilometers / days).toFixed(2) + ' km daily avg.';
        }

        attachments.push({
          color: i === 0 ? '#cfb53b' : i === 1 ? '#e6e8fa' : i === 2 ? '#8c7853' : '#f8f8f8',
          author_name: members[i][0],
          text: text
        });
      }

      return attachments;
    }

}
