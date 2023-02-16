const {SlashCommandBuilder} = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skipto")
        .setDescription("skips to a certain track number song")
        .addNumberOption((option)=>{
            return option.setName("tracknumber")
            .setDescription("number")
            .setMinValue(1).setRequired(true)
        }),
    run: async ({client, interaction}) =>{
        const queue = client.player.getQueue(interaction.guildId)

        if(!queue){
            return await interaction.editReply("There are no songs in the queue")
        }

        const trackNum = interaction.options.getNumber("tracknumber")
        if(trackNum>queue.tracks.length){
            return await interaction.editReply(`Track Number too big for ${queue.tracks.length} tracks`)
        }

        queue.skipTo()

        await interaction.editReply(`Skipped ahead to track ${trackNum}`)
    }

}