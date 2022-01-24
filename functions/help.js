module.exports = async function(interaction) {
  const commands = require('../data/commands.json');
  const groups = {};

  await interaction.editReply({
    content: "Here are the commands you can use:",
    ephemeral: true
  });

  for (let command of commands) {
    let group = command.help ? command.help.group : "Miscellaneous";
    let paramPrefix = "\r\n    - ";
    let text = `# \/${command.name}\r\n  * `;

    if (command.help) {
      if (Array.isArray(command.help.description)) {
        text += command.help.description.join(paramPrefix);
      } else {
        text += command.help.description;
      }
    } else {
      text += command.description;
    }

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(text);
  }


  for (let group in groups) {
    let output = "```markdown\r\n";
    output += group + "\r\n";
    output += "=".repeat(group.length) + "\r\n\r\n";

    output += groups[group].join("\r\n\r\n");

    output += "\r\n```";

    await Promise.all([
      interaction.followUp({
        content: output,
        ephemeral: true
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return true;
      }),
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000);
      })
    ]);
  }
};
