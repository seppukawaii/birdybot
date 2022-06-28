module.exports = async function(interaction) {
  const commands = require('../data/commands.json');
  const groups = new Set();
  const paramPrefix = "\r\n   - ";
  var content = "Pick a category to see the available commands.";

  for (let command of commands) {
    groups.add(command.help ? command.help.group : "Miscellaneous");
  }

  if (interaction.isMessageComponent()) {
    const group = interaction.values[0];
    content = "```markdown\r\n";
    content += group + "\r\n";
    content += "=".repeat(group.length) + "\r\n\r\n";

    for (let command of commands) {
      if (command.help?.group == group || (!command.help && group == "Miscellaneous")) {
        content += `# \/${command.name}`;

        if (command.help) {
          content += "\r\n * ";
          if (Array.isArray(command.help.description)) {
            content += command.help.description.join(paramPrefix);
          } else {
            content += command.help.description;
          }
        }

        content += "\r\n\r\n";
      }
    }

      content += "```";
  }

  await interaction.editReply({
    content: content,
    components: [{
      type: 1,
      components: [{
        type: 3,
        custom_id: "help_group",
        options: [...groups].sort((a, b) => a.localeCompare(b)).map((group) => {
          return {
            label: group,
            value: group
          }
        })
      }]
    }],
    ephemeral: true
  });
};
