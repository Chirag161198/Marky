const YTDL = require('ytdl-core')
const fetch = require("node-fetch")
const Discord = require('discord.js')

// !join command
function joinchannelcommand(arguements, receivedMessage){
    if(!receivedMessage.member.voiceChannel){
        receivedMessage.channel.send("You need to join a voice channel first 📢")
    }
    else{
        if(!receivedMessage.guild.voiceConnection){
            receivedMessage.member.voiceChannel.join()
            .then(connection => {
                receivedMessage.channel.send("🎶Successfully Joined🤙")
                conn = connection
                voiceChannel = receivedMessage.member.voiceChannel
                if(!servers[receivedMessage.guild.id]){
                    servers[receivedMessage.guild.id] = {queue : [], np: null}
                }
            })
            .catch((error)=>{
                receivedMessage.channel.send(`❌Can't join \`${receivedMessage.member.voiceChannel.name}\`. Missing permission❌`)
            })
        }
        else{
            receivedMessage.reply("Already in a voice channel 🎸")
        }
    }
}

// !leave command
function leavechannelcommand(arguements, receivedMessage){
    if(receivedMessage.guild.voiceConnection){
        var server = servers[receivedMessage.guild.id] 
        server.dispatcher = undefined
        server.np = null
        server.queue = []
        voiceChannel = null
        receivedMessage.guild.voiceConnection.disconnect();
    }
    else{
        receivedMessage.reply("Not in any voice channel currently")
    }
}

// !skip command
function skipcommand(arguements, receivedMessage){
    if(receivedMessage.guild.voiceConnection){
        //let members = 0 
        //voiceChannel.members.forEach(() => members++)
        //Math.ceil(members)
        var server = servers[receivedMessage.guild.id];
        server.dispatcher.end()
    }
    else{
        receivedMessage.reply("You need to be in the voice channel")
    }
}

// !np command
function nowplayingcommand(arguements, receivedMessage){
    if(servers[receivedMessage.guild.id]){
        if(server.np){
            var server = servers[receivedMessage.guild.id];
            receivedMessage.channel.send("Now Playing 🎧")
            displaySongDetails(receivedMessage, server.np)
        }
        else{
            receivedMessage.channel.send("Playing nothing right now")
        }
    }
    else{
        receivedMessage.channel.send("Playing nothing right now")
    }
}

// !queue command
function queuecommand(arguements, receivedMessage){
    if(receivedMessage.guild.voiceConnection){
        var server = servers[receivedMessage.guild.id]
        if(server.np){
            getYoutubeLink(arguements.join("+")).then((data)=>{
                server.queue.push(data);
                return data
            })
            .then((data)=>{
                receivedMessage.channel.send("Added to queue ✅")
                displaySongDetails(receivedMessage, data)
            })
        }
        else{
            playcommand(arguements, receivedMessage)
        }
    }
    else{
        receivedMessage.reply("You need to be in the voice channel")
    }
}

// !clear command
function clearcommand(arguements, receivedMessage){
    if(receivedMessage.guild.voiceConnection){
        var server = servers[receivedMessage.guild.id];
        server.queue = []
        receivedMessage.channel.send("Deleted items in queue 😟")
    }
    else{
        receivedMessage.reply("You need to be in the voice channel")
    } 
}

// !playlist command
function playlistcommand(arguements,receivedMessage){
    if(servers[receivedMessage.guild.id]){
        var server = servers[receivedMessage.guild.id];
        if(server.np){
            var playlist = new Discord.RichEmbed()
            playlist.addField("Now Playing 🎧",server.np.title)
            for(i=0;i<server.queue.length;i++){
                playlist.addField(`Track ${i+1}`,server.queue[i].title)
            }
            receivedMessage.channel.send(playlist)
        }
        else{
            receivedMessage.channel.send("Playlist is empty ⛔")
        }
    }
    else{
        receivedMessage.channel.send("Playlist is empty ⛔")
    }
}

// !play command
function playcommand(arguements, receivedMessage){
    if(receivedMessage.guild.voiceConnection){
        var server = servers[receivedMessage.guild.id];
        if(typeof server.dispatcher !== 'undefined'){
            queuecommand(arguements,receivedMessage);
            return
        } // Add the song to queue (to be completed)
        getYoutubeLink(arguements.join("+")).then((data)=>{
            server.queue.push(data);
            receivedMessage.channel.send("Playing 🎧")
            displaySongDetails(receivedMessage, data) 
            Play(conn, receivedMessage, server, data);
        })
    }
    else{
        receivedMessage.channel.send("How can I play music when not in voice channel?\nType `!join` to add me to your voice channel.")
    }
}

function getYoutubeLink(query){
    return fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q='+query+'&key='+process.env.YOUTUBE_API)
    .then((response)=>response.json())
    .then((response)=>{
        return {
            link: 'https://www.youtube.com/watch?v='+response.items[0].id.videoId,
            title: response.items[0].snippet.title,
            channel: response.items[0].snippet.channelTitle
        }
    })
}

function Play(connection, receivedMessage, server){
    server.dispatcher = connection.playStream(YTDL(server.queue[0].link, {filter: "audioonly", quality: "highestaudio"}));
    server.np = server.queue.shift();
    server.dispatcher.on("end",function(){
        if(receivedMessage.content == "!leave") return
        else if(receivedMessage.content == "!skip") return
        else if(server.queue[0]){
            receivedMessage.channel.send("Playing next song")
            displaySongDetails(receivedMessage, server.queue[0])
            Play(connection, receivedMessage, server);
        }
        else if(!server.queue[0]&&server.np){
            server.np = null
            connection.disconnect();
            receivedMessage.channel.send("Queue is empty\nLeaving the voice channel 👋")
        }
    })
}

function displaySongDetails(receivedMessage, data){
    let songDetails = {
        title: data.title,
        fields: [{
            name: "Channel",
            value: data.channel
        }]
    }
    receivedMessage.channel.send(new Discord.RichEmbed(songDetails))
}

module.exports = {
    join: joinchannelcommand,
    play: playcommand,
    leave: leavechannelcommand,
    np: nowplayingcommand,
    q: queuecommand,
    skip: skipcommand,
    playlist: playlistcommand,
    clear: clearcommand
}