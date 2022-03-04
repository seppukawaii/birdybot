module.exports = function(interaction) {
  require(`./birdypets/${interaction.customId}.js`)(interaction);
}
