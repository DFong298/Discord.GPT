require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js')
const { Configuration, OpenAIApi} = require('openai')

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
})

client.on('ready', (c) => {
    console.log(`${c.user.username} is ready!`)
})

const configuration = new Configuration({
    apiKey: process.env.CHATGPT_API
})

const openai = new OpenAIApi(configuration)

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    if (msg.content.startsWith('!')) return;
    let conversationLog = [{ role: 'system', content: "You are a helpful chatbot. Ensure that your responses do not exceed the word limit"}]

    await msg.channel.sendTyping();

    let prevMessages = await msg.channel.messages.fetch({limit:15});
    prevMessages.reverse();

    prevMessages.forEach((message) => {
        //if (message.author.id !== msg.author.id) return;
        conversationLog.push({
            role: 'user',
            content: message.content,
        })
    })


    const res = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
    })

    msg.reply(res.data.choices[0].message)
    
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'coin'){
        if (Math.random() < 0.50){
            interaction.reply('Heads!')
        } else {
            interaction.reply('Tails!')
        }
        
    }
})

client.login(process.env.TOKEN);