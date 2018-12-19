const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config()
var fetch = require("node-fetch");
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)

    //Change the status of the bot
    client.user.setActivity("You!", {type: "WATCHING"})

    //Print servers the bot is connected to
    client.guilds.forEach((guild)=> {
        console.log(guild.name)
    })

    // General Text id: 523763817394733074
    
    // Select a channel with the id
    // let generalChannel = client.channels.get("523763817394733074")
    
    /* Make an attachment object
    const attachment = new Discord.Attachment("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/330px-Image_created_with_a_mobile_phone.png")

    // Send an attachment to the channel selected
    generalChannel.send(attachment)

    // Send a message to the channel selected
    generalChannel.send("Hello, World!") */
})

// Event to respond to messages but it will be triggered for all messages, even that the has sent
client.on("message", (receivedMessage)=>{
    // Checking if the message was sent by bot: if yes, return an empty thing, otherwise follow the commands below
    if(receivedMessage.author == client.user){
        return 
    }

    // Checking the first letter if it is a command
    if (receivedMessage.content.startsWith("!")){
        processComand(receivedMessage)
    }
    else{
        receivedMessage.channel.send("Hii, try using `!help` or `!8ball`")
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
    else{
        receivedMessage.channel.send("Write `!help` for more")
    }
}

// !help command
function helpcommand(arguements, receivedMessage){
    receivedMessage.channel.send("Try using `!8ball [question]`")
}

// !8ball command
function eightballcommand(arguements, receivedMessage){
    if (arguements.length == 0){
        receivedMessage.channel.send("I'm not sure what you want to ask. Try `!8ball [question]`")
    }else{
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
    newsapi.v2.topHeadlines({
        language: 'en'
    }).then(response => {
        let data = {
            author: {
                name: "Headlines powered by NewsAPI.org",
                url: "https://newsapi.org/" 
            },
            fields : []
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

client.login(process.env.BOT_TOKEN)