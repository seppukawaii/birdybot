const API = require('../../helpers/api.js');

module.exports = async function(interaction) {
  const memberId = interaction.user.id;
  const egg = interaction.customId;

  if (egg == 'selectVariant') {
    interaction.editReply({
      content: interaction.message.content,
      embeds: interaction.message.embeds.map((embed) => {
        embed.description = embed.description ? embed.description.split("\r\n") : [];
        embed.description[0] = interaction.message.components[0].components[0].options.find((option) => option.value == interaction.values[0]).label;
        embed.description = embed.description.join("\r\n");

        embed.image.url = embed.image.url.replace(/([^\.\/]+\.[a-z]+)$/i, interaction.values[0]);

        return embed;
      }),
      components: interaction.message.components.map((actionRow) => {
        actionRow.components = actionRow.components.map((component) => {
          component.disabled = false;

          return component;
        });

        return actionRow;
      })
    });
  } else {
    API.call('hatch', 'POST', {
      loggedInUser: {
        auth: 'discord',
        token: memberId
      },
      egg: egg
    }).then(async (bird) => {
      var variant = bird.variants[0];
      var details = [variant.label + (variant.label && variant.subspecies ? ' - ' : '') + (variant.subspecies ? `${variant.subspecies} subspecies` : '') + "\r\n"];

      if (bird.owned > 1) {
        details.push('✅✅ You have more than one of this species');
      } else if (bird.owned == 1) {
        details.push('✅ You have this species');
      }

      if (bird.wishlisted == 2) {
        details.push('**🌟 You need this bird!**');
      } else if (bird.wishlisted == 1) {
        details.push('**❤️ You want this bird!**');
      }

      var components = [];

      if (bird.variants.length > 1) {
        components.push({
          type: 1,
          components: [{
            type: 3,
            custom_id: 'birdypets/hatched_selectVariant',
            options: bird.variants.map((variant) => {
              return {
                label: (variant.label + (variant.label && variant.subspecies ? ' - ' : '') + (variant.subspecies ? `${variant.subspecies} subspecies` : '')) + ' ',
                value: variant.id + '.' + variant.filetype,
                description: '© ' + variant.credit,
		      default: bird.variants[0] == variant.id, 
                emoji: variant.hatched ? {
                  name: "✅"
                } : null
              }
            }),
            placeholder: 'Select Variant'
          }]
        });
      }

      components.push({
        type: 1,
        components: [{
            type: 2,
            label: "Keep",
            style: 1,
            custom_id: 'birdypets/keep',
            emoji: {
              name: "❤️"
            }
          },
          {
            type: 2,
            label: "Release",
            style: 1,
            custom_id: `birdypets/release`,
            emoji: {
              name: "👋"
            }
          }
        ]
      });

      interaction.editReply({
        content: `You hatched the ${egg} egg to discover the **${bird.commonName}** inside!  Do you want to keep it or release it into the wild?`,
        embeds: [{
          title: bird.commonName,
          url: `https://squawkoverflow.com/birdypedia/bird/${bird.code}`,
          description: details.join("\r\n"),
          image: {
            url: bird.variants[0].image
          }
        }],
        components: components
      });
    });
  }
};
