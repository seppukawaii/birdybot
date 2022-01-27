const emojiUnicode = require("emoji-unicode");
const {
  Storage
} = require('@google-cloud/storage');
const {
  MessageAttachment
} = require('discord.js');
const storage = new Storage();
const bucket = storage.bucket('emojikitchen');
const sharp = require('sharp');

module.exports = function(interaction) {
  interaction.guild.emojis.fetch().then((emojiList) => {
    const emoji = emojiList.find((emoji) => emoji.animated && emoji.name == interaction.options.getString('emoji'));

    if (emoji) {
      interaction.channel.createWebhook(interaction.member.displayName, {
        avatar: interaction.member.avatarURL().replace('.webp', '.png')
      }).then((webhook) => {
        webhook.send(`<a:${emoji.name}:${emoji.id}>`).then(() => {
          interaction.editReply({
            content: ":thumbsup:",
            ephemeral: true
          }).then(() => {
            webhook.delete();
          });
        });
      });
    } else {
      var input = interaction.options.getString('emoji').match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);

      if (input && input.length == 2) {
        input = input.map((value) => emojiUnicode(value)).sort((a, b) => a.localeCompare(b));

        bucket.file(`u${input[0]}/u${input[1]}.png`).download().then(([data]) => {
          sharp(data).resize(128, 128).toBuffer().then((buffer) => {
            interaction.channel.createWebhook(interaction.member.displayName, {
              avatar: interaction.member.avatarURL()
            }).then((webhook) => {
              webhook.send({
                content: ' ',
                files: [{
                  attachment: buffer,
                  name: `u${input[0]}_u${input[1]}.png`
                }]
              }).then(() => {
                interaction.editReply({
                  content: ":thumbsup:",
                  ephemeral: true
                }).then(() => {
                  webhook.delete();
                });
              }).catch((err) => {
                webhook.delete();
                errorHandler(interaction, err);
              });
            }).catch((err) => {
              errorHandler(interaction, err);
            });
          });
        }).catch((err) => {
errorHandler(interaction, err);
	});
      } else {
        errorHandler(interaction, err);
      }
    }
  }).catch((err) => {
    errorHandler(interaction, err);
  });
}

function errorHandler(interaction, err) {
  interaction.editReply({
    content: `Sorry, I can't parse an emoji for \`${interaction.options.getString('emoji')}\``,
    ephemeral: true
  });
}
