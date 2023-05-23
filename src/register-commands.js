require('dotenv').config()
const { REST, Routes } = require('discord.js')

const commands = [
    {
        name: 'coin',
        description: 'Flips a coin'
    }
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering commands...")
        

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        )

        console.log("Commands registered!")
    } catch (error){
        console.log(`There was an error: ${error}`)
    }
})();