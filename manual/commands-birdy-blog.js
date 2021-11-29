const axios = require('axios');
const secrets = require('../secrets.json');
const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

const commands = require('../commands.json').map((command) => {
  delete command.help;
  return command;
});

const headers = {
  headers: {
    "Authorization": `Bot ${secrets.BOT_TOKEN}`
  }
};

const guildId = "863864246835216464";

var birdBlogs = [
  "allblackbirds",
  "baby-bird-beaks",
  "bigbirdpoof",
  "birdsagainstgravity",
  "birds-and-flowers",
  "birds-mid-noms",
  "birds-that-screm",
  "birdygotback",
  "bunch-of-birds",
  "camouflage-birds",
  "fullfrontalbirds",
  "mostly-moist-birds",
  "nearfrontalbirdity",
  "nightmare-birds",
  "orangeflappers",
  "perfect-plumage",
  "sleepy-bird-sleep",
  "fabulous-fuckers",
  "fascinator-birds",
  "flight-freeze-frame",
  "passerine-free-pass",
  "rainbow-birds",
  "transbirds",
  "this-is-a-nice-stick",
  "shiny-and-sparkling-birds",
  "tuxedo-birds",
  "is-that-bird--you-know",
  "run-bird-run",
  "xxxbirdsxxx",
  "kiss-kiss-bird-in-love",
  "birds-with-pants",
  "aesthetic-birds",
  "uglybabybirds",
  "sunbird-haven",
  "ready-red-birds",
  "shrike-is-love-shrike-is-life",
	"eye-see-a-bird"
];
var birdBlogCommands = [];
var birdBlogLetters = {};

birdBlogs.forEach((blog) => {
  let firstLetter = blog.slice(0, 1);

  if (!birdBlogLetters[firstLetter]) {
    birdBlogLetters[firstLetter] = [];
  }

  birdBlogLetters[firstLetter].push({
    "name": blog,
    "value": blog,
  });
});

for (let commandName of ["submit", "shuffle", "remove"]) {
  let birdBlogCommand = commands.find((command) => command.name == commandName);

  for (let letter in birdBlogLetters) {
    let command = {
      "name": `${letter}${commandName}`,
      "description": `${birdBlogCommand.description} (${letter})`,
      "default_permission": false,
      "options": [{
        "name": "blog",
        "description": "which niche bird blog",
        "type": 3,
        "required": true,
        "choices": birdBlogLetters[letter]
      }]
    }

    switch (commandName) {
      case "submit":
        command.options.push({
          "name": "url",
          "description": "Source URL",
          "type": 3,
          "required": true
        });
        command.options.push({
          "name": "speciescode",
          "description": "Species Code (ebird.org)",
          "type": 3,
          "required": false
        });
        break;
      case "remove":
        command.options.push({
          "name": "photo",
          "description": "SquawkOverflow Photo ID",
          "type": 3,
          "required": true
        });
        break;
    }

    birdBlogCommands.push(command);
  }
}

birdBlogCommands.push(commands.find((command) => command.name == "fix"));

axios.put(
    `https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/guilds/${guildId}/commands`,
    birdBlogCommands,
    headers
  ).then(async (response) => {
    for (let i = 0, len = response.data.length; i < len; i++) {
      var command = response.data[i];

      console.log("Updating permissions for ", command.name);

      await Promise.all([
        axios.put(
          `https://discord.com/api/v8/applications/${secrets.APPLICATION_ID}/guilds/${guildId}/commands/${command.id}/permissions`, {
            "permissions": [{
              "id": "864147373788889109",
              "type": 1,
              "permission": true
            }]
          },
          headers
        ).catch((err) => {
          console.log(err);
        }),
        new Promise((resolve, reject) => {
          setTimeout(resolve, 5000);
        })
      ]);
    }
  })
  .catch((err) => {
    console.dir(err, {
      depth: 10
    });
  });
