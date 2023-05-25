require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const { Configuration, OpenAIApi} = require('openai');
const Alpaca = require("@alpacahq/alpaca-trade-api");
const moment = require('moment');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
})

const alpaca = new Alpaca({
    keyId: process.env.ALPACA_ID,
    secretKey: process.env.ALPACA_KEY,
    paper: false,
});

client.on('ready', (c) => {
    console.log(`${c.user.username} is ready!`)
})

// Market Data
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'data'){
        const ticker = interaction.options.get('ticker').value.toUpperCase();
        
        let bars = alpaca.getBarsV2(
            ticker,
            {
              start: moment().subtract(7, "days").format(),
              end: moment().subtract(15, "minutes").format(),
              timeframe: "1Day",
            },
            alpaca.configuration
          );
          const barset = [];

        for await (let b of bars) {
            barset.push(b);
        }

        const week_open = barset[0].OpenPrice;
        const week_close = barset.slice(-1)[0].ClosePrice;
        const percent_change = ((week_close - week_open) / week_open) * 100;

        console.log(`${ticker} moved ${percent_change}% over the last 7 days`);
        console.log(barset[0])
    }
})


// Help Embed
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'help'){
        const embed = new EmbedBuilder()
        .setTitle('Bot Information')
        .setDescription('Bot with ChatGPT integration. Commands are below. Talk in specified channel to use ChatGPT.')
        .setColor('#702963')
        .setThumbnail('https://imgur.com/Se2U6B0.jpeg')
        .addFields({ 
            name: '/help',
            value: 'Brings up this embed (obviously)',
            inline: false,
         }, {
            name: '/coin',
            value: 'Flips a coin',
            inline: false,
         }, {
            name: 'More to come',
            value: ':)',
            inline: false,
         })
        .setTimestamp()
        .setFooter({ text: 'Bot made be me (Dennis)' })
        interaction.reply({ embeds: [embed]})
    }
})

// ChatGPT 
const configuration = new Configuration({
    apiKey: process.env.CHATGPT_API
})

const openai = new OpenAIApi(configuration)

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    if (msg.content.startsWith('!')) return;
    if (msg.channel.id !== process.env.CHANNEL1_ID && 
        msg.channel.id !== process.env.CHANNEL2_ID &&
        msg.channel.id !== process.env.CHANNEL3_ID) return; 

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

    msg.channel.send(res.data.choices[0].message)
    
})


// Coin Flip
client.on('interactionCreate', async (interaction) => {
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