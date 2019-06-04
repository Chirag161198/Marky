require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
var fetch = require("node-fetch")
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI(process.env.NEWS_API_KEY)
const musicFunctions = require('./musicCommands.js')
const joinchannelcommand = musicFunctions.join
const playcommand = musicFunctions.play
const leavechannelcommand = musicFunctions.leave
const nowplayingcommand = musicFunctions.np
const queuecommand = musicFunctions.q
const skipcommand = musicFunctions.skip
const playlistcommand = musicFunctions.playlist
const clearcommand = musicFunctions.clear

global.servers = {};
let conn = null ;
let voiceChannel = null;

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)

    //Change the status of the bot
    client.user.setActivity("!help", {type: "LISTENING"})

    client.guilds.forEach((guild)=> {
        console.log(`Server: ${guild.name} Owner: ${guild.owner} Members: ${guild.memberCount}`)
    })
})

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(ch => ch.name == process.env.MEMBERLOG);
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the ${member.guild.name}, ${member} 🍻`);
});

client.on('guildCreate', guild => {
    console.log(`Marky added to ${guild.name} on ${new Date()} owned by ${guild.owner.displayName}`)
    
    // Finding general channel, if general not availaible then take first channel available
    let general = null
    guild.channels.forEach((channel)=>{
        if(channel.name == 'general' && channel.type == 'text'){
            general = channel
        }        
    })
    if(general == null){
        for (var i=0 ; i<guild.channels.length ; i++){
            if(guild.channels[i].type == 'text'){
                general = guild.channels[i]
                break
            }
        }
    }

    // Making required channels
    const reqChannels = ['welcome-members','music']
    for(i=0;i<reqChannels.length;i++){
        if(guild.channels.find(channel => channel.name == reqChannels[i]) == undefined){
            guild.createChannel(reqChannels[i],'text').then((channel)=>{
                channel.send(` Created \`${channel.name}\` channel to use it for specific commands of Marky\nType \`!help\` for more`)
            })
        }
    }

    // Making required roles
    const reqRoles = [{
        name: 'ADMIN',
        color: 0xff0000,
        permissions: 1342178359,
        mentionable: false
    },{
        name: 'MOD',
        color: 0xff6600,
        permissions: 1073742869,
        mentionable: true
    }]
    for(i=0;i<reqRoles.length;i++){
        if(guild.roles.find(role => role.name == reqRoles[i].name) == undefined){
            guild.createRole(reqRoles[i],'To use special commands of Marky like !setActivity, kick & ban commands, etc (Make sure the roles have appropriate permission to perform actions').then((role)=>{
                general.send(`Created \`${role.name}\` role for specific commands of Marky\nType \`!type\` for more`)
            })
        }
    }

    // Making Owner the ADMIN
    guild.roles.forEach((role)=>{
        if(role.name == 'ADMIN'){
            guild.owner.setRoles([role.id],'Assigned by Marky').then((owner)=>{
                general.send(`Server owner: ${owner.displayName} is now ADMIN`)
            }).catch((error)=>{
                if(error.message == 'Missing Permissions'){
                    general.send("The member who invited me do not have the required permission.\nType `!help` for more help")
                }
            })
        }
    })
})

client.on('guildDelete', guild => {
    console.log(`Marky removed from ${guild.name} on ${new Date()} owned by ${guild.owner.displayName}`)
})

// Event to respond to messages but it will be triggered for all messages, even that the has sent
client.on("message", (receivedMessage)=>{
    // Checking if the message was sent by bot: if yes, return an empty thing, otherwise follow the commands below
    if(receivedMessage.author == client.user){
        return 
    }
    // Checking if the user was bot
    if(receivedMessage.author.bot){
        return
    }
    // Checking if the channel was DM
    if(receivedMessage.channel.type == 'dm'){
        receivedMessage.reply("Commands can only be used in a server")
        return
    }
    // Checking the first letter if it is a command
    else if (receivedMessage.content.startsWith("!")){
        processComand(receivedMessage)
    }
})

// Split command parts and call the appropriate function
function processComand(receivedMessage){
    let fullcommand = receivedMessage.content.substr(1)
    let splitcommand = fullcommand.split(" ")
    let primarycommand = splitcommand[0]
    let arguements = splitcommand.slice(1)
    
    if(primarycommand == "help"){
        helpcommand(arguements,receivedMessage)
    }
    else if(primarycommand == "8ball"){
        eightballcommand(arguements, receivedMessage)
    }
    else if(primarycommand == "news"){
        newscommand(arguements, receivedMessage)
    }
    else if(primarycommand == "gif"){
        gifcommand(arguements, receivedMessage)
    }
    else if(primarycommand == "weather"){
        weathercommand(arguements, receivedMessage)
    }
    else if(primarycommand == "inviteLink"){
        let data = {
            title: "Click here to add Marky to your server",
            url: process.env.INVITE_LINK,
            description: "Excited to join new servers 🍻",
            color: 0xf2f2f2
        }
        receivedMessage.channel.send(new Discord.RichEmbed(data))
    }
    else if(receivedMessage.channel.name == 'music'){
        if(primarycommand == "join"){
            joinchannelcommand(arguements, receivedMessage)
        }
        else if(primarycommand == "leave"){
            leavechannelcommand(arguements, receivedMessage)
        }
        else if(primarycommand == "play"){
            if(arguements.length == 0){
                receivedMessage.channel.send("Try using `!play [song]`")
            }
            else{
                playcommand(arguements, receivedMessage)
            }
        }
        else if(primarycommand == "np" || primarycommand == "nowplaying"){
            nowplayingcommand(arguements, receivedMessage)
        }
        else if(primarycommand == "q" || primarycommand == "queue"){
            queuecommand(arguements, receivedMessage)
        }
        else if(primarycommand == "skip"){
            skipcommand(arguements, receivedMessage)
        }
        else if(primarycommand == "playlist"){
            playlistcommand(arguements, receivedMessage)
        }
        else if(primarycommand == "clear"){
            clearcommand(arguements, receivedMessage)
        }
    }
    else{
        receivedMessage.react("😕")
        receivedMessage.channel.send("Write `!help` for more 🔍")
    }
}

// !help command
function helpcommand(arguements, receivedMessage){
    let textCommands = "`!8ball [question]` - Play 8ball game with me\n`!news [query]` - Get news headlines. Default query is \'India\'\n`!gif [search]` - search for gif\n`!weather [city-name]` - get weather update of a city\n`!inviteLink` - Get Marky's Invite Link";

    let musicCommands = "`!join` - Joins a voice channel\n`!leave` - leaves the voice channel\n`!play [song]` - Plays the song\n`!np` - Shows the song currently playing\n`!q [song]` - Adds the song to queue\n`!skip` - Skips the current song\n`!playlist` - Shows the playlist\n`!clear` - Clears the playlist"

    let features = "Welcomes new member in `welcome-members` channel";
    let str = {
        title: "Getting Started ‼",
        fields: [{
            name: "Text Commands",
            value: textCommands
        },{
            name: "Music Commands (Only works in `music` channel)",
            value: musicCommands
        },{
            name: "Other Features",
            value: features
        }],
        color: 0xff6600
    }
    receivedMessage.channel.send(new Discord.RichEmbed(str))
}

// !8ball command
function eightballcommand(arguements, receivedMessage){
    if (arguements.length == 0){
        receivedMessage.channel.send("I'm not sure what you want to ask. Try `!8ball [question]`")
    }else{
        receivedMessage.react("🎱")
        let params = encodeURIComponent(arguements.join(" "))
        let uri = "https://8ball.delegator.com/magic/JSON/" + params
        fetch(uri)
            .then((res)=>{ return res.json() })
            .then((res)=>{
                receivedMessage.channel.send(res.magic.answer)
            })
    }
}

// !news command
function newscommand(arguements, receivedMessage){
    if(arguements.length == 0){
        arguements = ['India']
    }
    url = 'https://news-api-chirag.herokuapp.com/news/' + arguements.join('%20')
    fetch(url)
        .then((res)=>{
            return res.json()
        })
        .then((response)=>{
            let data = {
                author: {
                    name: "Headlines powered by News API",
                    url: "https://news-api-chirag.herokuapp.com" 
                },
                fields : [],
                color: 0x0000b3
            }; 
            for(let i=0;i<response.length;i++){
                res = response[i];
                let field = {
                    name: res.category + ' : ' + res.title,
                    value: res.link,
                    inline: false
                }
                data.fields.push(field)
            }
            receivedMessage.channel.send(new Discord.RichEmbed(data))
        })    
    receivedMessage.react("🗞")
}

// !gif command
function gifcommand(arguements,receivedMessage){
    if(arguements.length==0){
        receivedMessage.channel.send("Use `!gif [search query]`")
    }
    else{
        fetch('https://api.tenor.com/v1/search?key=' + process.env.GIF_API_KEY + '&q=' + encodeURIComponent(arguements.join(" ")) + '&limit=1')
        .then((res)=>{ return res.json() })
        .then((res)=> {
            receivedMessage.channel.send(res.results[0].itemurl)
        })
    }
}

// !weather command
function weathercommand(arguements, receivedMessage){
    if(arguements.length==0){
        receivedMessage.channel.send("Use `!weather [city name]`")
    }
    else{
        fetch('https://api.openweathermap.org/data/2.5/weather?q=' + arguements.join(" ") + '&APPID=' + process.env.WEATHER_API_KEY)
        .then((res)=>{ return res.json() })
        .then((res)=> {
            if(res.cod==429){
                receivedMessage.channel.send("This service is unavailaible currently.\nTry after an hour")
            }
            else if(res.cod==404){
                receivedMessage.channel.send("City name not found.\nMake sure you have entered city name and not state name")
            }
            else{
                let data = {
                    title: "Weather in " + res.name,
                    description: res.weather[0].main,
                    color: 0x206020,
                    fields : [{
                        name: "Temperature",
                        value: parseFloat((res.main.temp - 273.15).toFixed(2)) + ' C'
                    },{
                        name: "Humidity",
                        value: res.main.humidity + " %"
                    },{
                        name: "Wind",
                        value: res.wind.speed + " m/s, " + res.wind.deg + " degrees"
                    }]
                }
                if(parseFloat((res.main.temp - 273.15).toFixed(2))>=35){
                    data.fields[0].value = data.fields[0].value + ' 🌡'
                }else if(parseFloat((res.main.temp - 273.15).toFixed(2))<35&&parseFloat((res.main.temp - 273.15).toFixed(2))>=22){
                    data.fields[0].value = data.fields[0].value + ' 🌤'
                }else if(parseFloat((res.main.temp - 273.15).toFixed(2))<22&&parseFloat((res.main.temp - 273.15).toFixed(2))>=10){
                    data.fields[0].value = data.fields[0].value + ' ☁'
                }else if(parseFloat((res.main.temp - 273.15).toFixed(2))<10){
                    data.fields[0].value = data.fields[0].value + ' 🌨'
                }
                
                receivedMessage.channel.send(new Discord.RichEmbed(data));
            }
        })
    }
}

client.login(process.env.BOT_TOKEN)