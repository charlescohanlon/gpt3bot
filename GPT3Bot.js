const { App } = require("@slack/bolt");
const axios = require("axios");
require("dotenv").config();

const PORT = 3000;
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

	if (text.match(/(I'm\ going\ to\ go\ now)/i)) {
		await say("Goodbye.");
		state = States.NOTSTARTED;
		return;
	}

	if (state === States.CHOOSERECIPIENT) {
		await chooseRecipient(text);
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
			state = States.CHOOSERECIPIENT;
			await say("Who would you like to talk to now (Ada, Babbage, Curie, or Davinci)?");
			return;
		}
		getResponse(text, say);
		return;
	}

});

async function chooseRecipient(text) {
	recipient = undefined;
	if (text.match(/(ada)/i)) recipient = "ada-001";
	else if (text.match(/(babbage)/i)) recipient = "babbage-001";
	else if (text.match(/(curie)/i)) recipient = "curie-001";
	else if (text.match(/(davinci)/i)) recipient = "davinci-002";
}

async function getResponse(text, say) {
	try {
		const data = `{"model": "text-${recipient}", "prompt": "${text}", "temperature": 0, "max_tokens": 4000}`;
		const headers = { headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` } };
		const res = await axios.post("https://api.openai.com/v1/completions", data, headers);
		await say(`${recipient}: ` + res.data.choices[0].text);
	} catch (err) {
		console.log(err);
	}
}


(async () => {
	await app.start(PORT);
})();
