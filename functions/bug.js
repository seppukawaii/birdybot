const API = require('../helpers/api.js');
const Secrets = require('../secrets.json');
const Trello = require("node-trello");

const {
  Modal,
  TextInputComponent,
  showModal
} = require('discord-modals');

module.exports = async function(interaction) {
  if (interaction.type == 'APPLICATION_COMMAND') {
    const modal = new Modal()
      .setCustomId(`bug_${Date.now()}`)
      .setTitle('Bug Report')
      .addComponents(
        new TextInputComponent()
        .setCustomId('bug')
        .setStyle('LONG')
        .setLabel("What happened, or what DIDN'T happen?")
        .setRequired(true)
      );

    showModal(modal, {
      client: interaction.client,
      interaction: interaction
    });
  } else if (interaction.type == 'MODAL_SUBMIT') {
    const trello = new Trello(Secrets.TRELLO.KEY, Secrets.TRELLO.TOKEN);
    var report = interaction.getTextInputValue('bug');

	      await interaction.deferReply({
      ephemeral: true
    })

    trello.post("/1/cards", {
      name: report,
      desc: `Reported by ${interaction.member.displayName} (${interaction.user.id})`,
      idList: '616863d9071f1c88feb22769'
    }, function(err, card) {
      if (err) {
        interaction.editReply({
          content: "Sorry, but something went wrong submitting the bug report to Trello! <@121294882861088771> needs to take a look."
        });
      } else {
        var bugs = [
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/bug_1f41b.png",
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/ant_1f41c.png",
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/beetle_1fab2.png",
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/lady-beetle_1f41e.png",
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/cricket_1f997.png",
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/openmoji/292/mosquito_1f99f.png"
        ];

        interaction.guild.channels.fetch('888535114236174367').then((channel) => {
          channel.edit({
            topic: 'days since last bug:  :zero:'
          });

          channel.send({
            content: `<${card.url}>`,
            embeds: [{
              title: "A bug!!",
              description: `<@${interaction.user.id}> found a bug!\r\n\r\n\`${report}\``,
              thumbnail: {
                url: bugs.sort(() => .5 - Math.random())[0]
              }
            }]
          });
        });

        API.call('bug', 'PUT', {
          members: [{
            auth: 'discord',
            token: interaction.user.id
          }],
          bugs: 1
        });

        interaction.editReply({
          content: `Thanks for your bug report!  You can follow its progress on Trello at <${card.url}>`
        });
      }
    });
  }
}
