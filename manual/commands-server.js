const secrets = require('../secrets.json');
const commands = require('../data/commands.json');

const {
  REST
} = require('@discordjs/rest');

const {
  Routes
} = require('discord-api-types/v9');

const rest = new REST({
  version: '9'
}).setToken(secrets.DISCORD.BOT_TOKEN);

var birdBlogCommands = ["submit", "shuffle", "remove", "fix"];
var serverCommands = commands.filter((command) => !command.global && !birdBlogCommands.includes(command.name));

var birdBlogLetters = {};
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

    serverCommands.push(command);
  }
}

serverCommands.push(commands.find((command) => command.name == "fix"));

try {
  console.log('Started refreshing application commands.');

  rest.put(
    Routes.applicationGuildCommands(secrets.DISCORD.APPLICATION_ID, secrets.DISCORD.GUILD_ID), {
      body: serverCommands
    },
  );

  console.log('Successfully reloaded application commands.');
} catch (error) {
  console.error(error);
}

/*
axios.put(
    `https://discord.com/api/v8/applications/${secrets.DISCORD.APPLICATION_ID}/guilds/${secrets.DISCORD.GUILD_ID}/commands`,
    serverCommands,
    headers
  ).then(async (response) => {
    for (let i = 0, len = response.data.length; i < len; i++) {
      var command = response.data[i];

      if (birdBlogCommands.includes(command.name)) {
        console.log("Updating permissions for ", command.name);

        await Promise.all([
          axios.put(
            `https://discord.com/api/v8/applications/${secrets.DISCORD.APPLICATION_ID}/guilds/${secrets.DISCORD.GUILD_ID}/commands/${command.id}/permissions`, {
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
    }
  })
  .catch((err) => {
    console.dir(err, {
      depth: 10
    });
  });
*/
