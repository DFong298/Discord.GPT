require('dotenv').config()
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js')

const commands = [
    {
        name: 'data',
        description: 'Retrieves market data of specified ticker',
        options: [
            {
                name: 'ticker',
                description: 'Stock ticker',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'time-frame',
                description: 'Data time frame',
                type: ApplicationCommandOptionType.Number,
                choices: [
                    {
                        name: 'One day',
                        value: 1,
                    }, 
                    {
                        name: 'One week',
                        value: 7,
                    },
                    {
                        name: 'One month',
                        value: 30,
                    },
                    {
                        name: 'Six months',
                        value: 180,
                    },
                    {
                        name: 'One year',
                        value: 365,
                    }
                ],
                required: true
            }
        ]
    },
    {
        name: 'coin',
        description: 'Flips a coin'
    },
    {
        name: 'help',
        description: 'Bot information'
    }
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering commands...")
        

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {body: commands}
        )

        console.log("Commands registered!")
    } catch (error){
        console.log(`There was an error: ${error}`)
    }
})();