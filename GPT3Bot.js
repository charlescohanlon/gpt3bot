const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});



const States = {
	STARTED: "STARTED",
	NOTSTARTED: "NOTSTARTED",
	RECIPIENTCHOSEN: "RECIPIENTCHOSEN",
}

let state = States.NOTSTARTED;
let recipient;
app.message(async ({ message: { text }, say }) => {

	if (state === States.NOTSTARTED && text.match(/Hello (gpt3|gpt-3)/i)) {
		await say("Hello, which AI would you like to talk to (ada, babbage, curie, or davinci)?")
		state = States.STARTED;
		return;
	}

	if (state === States.STARTED) {
		await chooseRecipient(text, say);
		if (recipient) {
			state = States.RECIPIENTCHOSEN;
			say(`You are now talking to ${recipient}.`);
		}
		return;
	}

	if (state === States.RECIPIENTCHOSEN) {
		return;
	}

});

async function chooseRecipient(text, say) {
	if (text.match(/(ada)/)) recipient = "ada";
	else if (text.match(/(babbage)/)) recipient = "babbage";
	else if (text.match(/(curie)/)) recipient = "curie";
	else if (text.match(/(davinci)/)) recipient = "davinci";
	else await say("I'm afraid I don't understand. Who would you like to talk to (ada, babbage, curie, or davinci)?");
}


(async () => {
	await app.start(3000);
})();
