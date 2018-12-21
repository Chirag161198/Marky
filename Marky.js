require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
var fetch = require("node-fetch")
const NewsAPI = require('newsapi')
const newsapi = new NewsAPI(process.env.NEWS_API_KEY)

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
    //Change the status of the bot
    client.user.setActivity("You!", {type: "WATCHING"})
    //Print servers the bot is connected to
    client.guilds.forEach((guild)=> {
        console.log(guild.name)
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
    else if(primarycommand == "activityMarky"){
        activitycommand(arguements, receivedMessage)
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
    else{
        receivedMessage.react("😕")
        receivedMessage.channel.send("Write `!help` for more 🔍")
    }
}

// !help command
function helpcommand(arguements, receivedMessage){
    let textCommands = "`!8ball [question]` - Play 8ball game with Marky\n`!news` - Get news headlines\n`!gif [search]` - search for gif\n`!weather [city-name]` - get weather update of a city\n`!activityMarky [playing|streaming|listening|watching] [text]` - change Marky's Activity\n`!inviteLink` - Get Marky's Invite Link";
    let features = "Add a channel `welcome-members` to let Marky welcome new members\nOnly members with `ADMIN` role can change Marky's activity";
    let str = {
        title: "Getting Started 🤪",
        fields: [{
            name: "Text Commands",
            value: textCommands
        },{
            name: "Other Features",
            value: features
        }],
        color: 0xff6600
    }
    receivedMessage.channel.send(new Discord.RichEmbed(str))
}

// !activity command
function activitycommand(arguements, receivedMessage){
    let admin = receivedMessage.member.roles.find((member)=>member.name == 'ADMIN')
        if(admin==null){
            receivedMessage.react("😝")
            receivedMessage.channel.send("You are not authorized to change my activity. 😎\nTry `!help` for more information")
        }
        else if(arguements.length>=2&&(arguements[0].toLowerCase()=="playing"||arguements[0].toLowerCase()=="streaming"||arguements[0].toLowerCase()=="listening"||arguements[0].toLowerCase()=="watching")){
            client.user.setActivity(arguements.slice(1).join(" "), {type: arguements[0].toUpperCase()})
        }
        else{
            receivedMessage.channel.send("What should I do?\nTry `!activityMarky watching you`")
        }
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
    receivedMessage.react("🗞")
    newsapi.v2.topHeadlines({
        language: 'en'
    }).then(response => {
        let data = {
            author: {
                name: "Headlines powered by NewsAPI.org",
                url: "https://newsapi.org/" 
            },
            fields : [],
            color: 0x0000b3
        }; 
        for(let i=0;i<5;i++){
            let field = {
                name: response.articles[i].title,
                value: response.articles[i].url,
                inline: false
            }
            data.fields.push(field)
        }
        receivedMessage.channel.send(new Discord.RichEmbed(data))
    })
    
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