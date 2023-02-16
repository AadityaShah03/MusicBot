const Discord = require("discord.js")
const dotenv = require("dotenv")

const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")

const fs = require("fs")
const { Player } = require("discord-player")

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load" 
//process.argv[2] == "load" is true for command "load", bool load slash is true


const CLIENT_ID = "1075525712812982323"
const GUILD_ID = "969518748451102730"

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

//const client = new Discord.Client({
//        intents:[
//            "GUILDS",
//            "GUILD_VOICE_STATES"
//        ]
//})//discord client

client.slashcommands = new Discord.Collection()

client.player = new Player(client,{
    ytdlOptions:{
        quality: "highestaudio",
        highWaterMark: 1<<25
    }
})//player information, Potential new player needed?


let commands = [] // Array of commands

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith('.js')) // command reader from files
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)//contents of file
    client.slashcommands.set(slashcmd.data.name,slashcmd) // set command information

    if(LOAD_SLASH){
        commands.push(slashcmd.data.toJSON()) //push command to command array if loading commands
    }

}


if(LOAD_SLASH){
    const rest = new REST({version:"9"}).setToken(TOKEN)
    console.log("deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),{body:commands})// deploy commands to client and guild/server id
    .then(()=>{
        console.log("Successfully loaded commands")
        process.exit(0)
    })
    .catch((err)=>{
        console.log(err)
        process.exit(1)
    })
} else{
    client.on("ready",()=>{
        console.log(`logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate",(interaction)=>{
        async function handleCommand() {

            if(!interaction.isCommand()){
                return // if not a command, ignore it
            }

            const slashcmd = client.slashcommands.get(interaction.commandName)//get command from command name

            if(!slashcmd){
                interaction.reply("not a valid slash command")
            }
            await interaction.deferReply()
            await slashcmd.run({client, interaction})
        }
        handleCommand()
    })

    client.login(TOKEN)
}

