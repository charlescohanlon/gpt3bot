const { App } = require("@slack/bolt");
const axios = require("axios");
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
	CHOOSERECIPIENT: "CHOOSERECIPIENT",
	RECIPIENTCHOSEN: "RECIPIENTCHOSEN",
}

let state = States.NOTSTARTED;
let recipient;
app.message(async ({ message: { text }, say }) => {

	if (state === States.NOTSTARTED && text.match(/Hello (gpt3|gpt-3)bot/i)) {
		await say("Hello, which AI would you like to talk to (Ada, Babbage, Curie, or Davinci)?")
		state = States.CHOOSERECIPIENT;
		return;
	}

	if (state === States.CHOOSERECIPIENT) {
		await chooseRecipient(text, say);
		if (recipient) {
			await say(`${recipient}: Greetings, my name is ${recipient}, how can I help you today?`);
			state = States.RECIPIENTCHOSEN;
		} else {
			await say("I'm afraid I don't understand. Who would you like to talk to (Ada, Babbage, Curie, or Davinci)?");
		}
		return;
	}

	if (state === States.RECIPIENTCHOSEN) {
		if (text.match(/(talk\ to\ someone\ else)/i)) {
			await say(`${recipient}: Alright, it was nice talking with you.`);
			await say("Who would you like to talk to (Ada, Babbage, Curie, or Davinci)?");
			state = States.CHOOSERECIPIENT;
			return;
		}
		if (text.match(/(I'm\ going\ to\ go\ now)/i)) {
			await say("Goodbye.");
			state = States.NOTSTARTED;
			return;
		}
		getResponse(text, say);
		return;
	}

});

async function chooseRecipient(text, say) {
	recipient = undefined;
	if (text.match(/(ada)/i)) recipient = "ada-001";
	else if (text.match(/(babbage)/i)) recipient = "babbage-001";
	else if (text.match(/(curie)/i)) recipient = "curie-001";
	else if (text.match(/(davinci)/i)) recipient = "davinci-002";
}

async function getResponse(text, say) {
	try {
		const res = await axios.get("https://api.openai.com/v1/completions", {
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
			},
			data: {
				"model": "text-davinci-002",
				"prompt": "Say this is a test",
				"temperature": 0,
				"max-tokens": 6
			}
		});
		console.log(res);
	} catch (err) {
		console.error(err);
	}

	await say(`${recipient}: Lorem ipsum something something`);
}


(async () => {
	await app.start(3000);
})();
