# Marky (Discord Bot)

## About Marky
Marky is a discord bot made in JavaScript using `discord.js`. Currently hosted on heroku using free dyno. 

Permissions Marky require:
Manage server, Manage channels, Manage roles, Kick and Ban members, Create instant invite, Manage emojis, View channels, All text permissions, Connect, Speak, Use members & Use voice activity

[Marky's Invite Link](https://discordapp.com/api/oauth2/authorize?client_id=524254823160217607&permissions=1396178295&scope=bot)

[discord.js Documentation](https://discord.js.org/#/)

## Versions
### version 1.0 commands and features:
* !help - Get command list
* !8ball [question] - Play 8ball game with marky |[API reference](https://8ball.delegator.com/)
* !news - Get news headlines | [API reference](https://newsapi.org/)
* !gif [search] - Search for gif | [API reference](https://tenor.com/gifapi/documentation#quickstart)
* !weather [city-name] - Get weather update of a city [API reference](https://openweathermap.org/api)
* !inviteLink - Get Marky's Invite Link
* Welcome members in the `welcome-members` channel

### version 2.0 commands and features:

- Music Commands (Only works in `music` channel)
  - !join - Joins a voice channel
  - !leave - Leaves the voice channel
  - !play [song] - Plays the song from youtube | [API reference](https://console.developers.google.com/apis/dashboard?project=discord-bot-marky)
  - !np - Shows the song currently playing
  - !q [song] - Adds the song to queue
  - !skip - Skips the current song
  - !playlist - Shows the playlist
  - !clear - Clears the playlist
- Cannot be used in DM channels now
- Creates the required channels (`welcome-members`,`music`) if not available when added to server
- Creates the required roles (`ADMIN`,`MOD`) when added to server and sends the details to `general` channel (if not available, then picks up first text channel)

- ADMIN PERMISSIONS:
Manage server, Manage roles, Manage channels, Kick members, Ban members, Create instant invite, Manage emojis & View channels
- MOD PERMISSIONS:
Manage channels, Ban members, Create instant invite, Manage emojis, View channels
- +version 1.0 commands and features