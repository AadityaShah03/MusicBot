const {SlashCommandBuilder} = require("@discordjs/builders")
const { EmbedBuilder } = require('discord.js');
const {QueryType} = require("discord-player")

module.exports={
    data: new SlashCommandBuilder() // data about commands
    .setName('play')// /play
    .setDescription('loads songs from youtube for now')
    .addSubcommand((subcommand)=>
        subcommand.setName("song") // name in code for song option
        .setDescription("load a song from a url")
        .addStringOption((option)=> option.setName("url")
        .setDescription("Song url").setRequired(true))
        // string entry that says url and is required
    )
    .addSubcommand((subcommand)=>// playlist
        subcommand.setName("playlist") // name in code for playlist option
        .setDescription("Loads playlist from url")
        .addStringOption((option)=> option.setName("url")
        .setDescription("Playlist url").setRequired(true))
    )
    .addSubcommand((subcommand)=>// search
        subcommand.setName("searching") // name in code for search option
        .setDescription("searches for song from keywords")
        .addStringOption((option)=> option.setName("keywords")
        .setDescription("Serach Keywords").setRequired(true))
    ),
    run: async ({client,interaction})=>{ // running commands

        if(!interaction.member.voice.channel){
            return interaction.editReply("you need to be in a voice channel to use this command")
        } // if not in a voice channel, you can't run these play commands

        const queue = await client.createQueue(interaction.guild, {
            ytdlOptions: {
                    quality: "highest",
                    filter: "audioonly",
                    highWaterMark: 1 << 30,
                    dlChunkSize: 0,
                },
            metadata: interaction.channel,
          });

        if(!queue.connection){
            await queue.connect(interaction.member.voice.channel)
            //join voice channel if not in one
        }

        let embed = new EmbedBuilder()

        if(interaction.options.getSubcommand()==="song"){
            let url = interaction.options.getString("url")// get value of string named url

            const result = await client.player.search(url,{ // find results
                requstedBy: interaction.user, // save info about user who requested
                searchEngine: QueryType.YOUTUBE_VIDEO // search using youtube
            })

            if(result.tracks.length===0){
                return interaction.editReply(`${url} produced no results`) 
                // if no results from youtube URL, tell user no results
            }

            const song = result.tracks[0]//take first result
            await queue.addTrack(song)//add to queue

            embed
            .setDescription(`**[${song.title}](${song.url}) has been added to the queue`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`})

        }else if(interaction.options.getSubcommand()==="playlist"){
            let url = interaction.options.getString("url")// get value of string named url

            const result = await client.player.search(url,{ // find results
                requstedBy: interaction.user, // save info about user who requested
                searchEngine: QueryType.YOUTUBE_PLAYLIST // search using youtube playlists
            })

            if(result.tracks.length===0){
                return interaction.editReply(`${url} produced no results`) 
                // if no results from youtube URL, tell user no results
            }

            const playlist = result.playlist//take first result
            await queue.addTracks(result.tracks)//add to queue

            embed
            .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url}) has been added to the queue`)
            .setThumbnail(playlist.thumbnail)
        }else if(interaction.options.getSubcommand()==="searching"){
            let url = interaction.options.getString("keywords")// get value of string named url

            const result = await client.player.search(url,{ // find results
                requstedBy: interaction.user, // save info about user who requested
                searchEngine: QueryType.AUTO // TODO Decide what to do this search for
            })

            if(result.tracks.length===0){
                return interaction.editReply(`${url} produced no results`)
                // if no results from youtube URL, tell user no results
            }

            const song = result.tracks[0]//take first result
            //TODO make a way to decide which track to pick
            await queue.addTrack(song)//add to queue

            embed
            .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`})

        }

        console.log(queue.playing)
        if(!queue.playing){
            await queue.play() // play queue if its not playing
            queue.playing = true
        }

        await interaction.editReply({
            embeds: [embed]
        })


    }
}