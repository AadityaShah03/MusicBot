const {SlashCommandBuilder} = require("@discordjs/builders")
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Song Queue display")
    .addNumberOption((option)=>
        option.setName("page")
        .setDescription("page number of the queue")
        .setMinValue(1)
    ),
    run: async ({client,interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)
        if(!queue || !queue.playing){
            return await interaction.editReply("There are no tracks in the queue")
        }
        const totalPages = Math.ceil(queue.tracks.length/10) || 1
        const page = (interaction.options.getNumber("page")||1)-1

        if(page>totalPages){
            return await interaction.editReply(`Invalid page. There are only ${totalPages} pages`)
        }

        const queueString = queue.tracks.slice(page*10,page*10+10).map((song,i)=>{
            return `**${page*10+i+1} \`[${song.duration}]\` ${song.title} -- <@${song.id}>`
        }).join("\n")

        const currentSong = queue.tracks[0]

        console.log(`Current Song \n${queue.tracks[0]}\n`)
        console.log(`queue \n${queue.playing}`)

        await interaction.editReply({
            embeds:[
                new EmbedBuilder()
                .setDescription(`**Currently Playing**\n`+
                    (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} -- <@${currentSong.id}>` : "No song is currently playing") +
                    `\n\n**Queue**\n${queueString}`
                ).setFooter({
                    text: `Page ${page+1} of ${totalPages}`
                }).setThumbnail(currentSong.thumbnail)
            ]
        })
    }
}
