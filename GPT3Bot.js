const { WebClient } = require("@slack/web-api");
require("dotenv").config();

console.log(process.env.SLACK_TOKEN)
// const web = new WebClient(process.env.SLACK_TOKEN);