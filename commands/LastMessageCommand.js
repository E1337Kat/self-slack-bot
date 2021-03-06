class LastMessageCommand extends frozor.Command{
    constructor(){
        super({
            name: 'last',
            aliases: ['lastmessage'],
            description: 'Gets last message for a user',
            args: [new frozor.CommandArg('user', 'String')]
        });
    }

    async run(msg, bot){
        const lookup = msg.args[0];

        async function getLastMessage(user) {
            msg.edit('Looking up last sent message...');

            try{
                const res = await bot.api.methods.search.messages({
                    query: `from:${user.name}`,
                    sort: 'timestamp',
                    count: 1
                });

                if(res.messages.total === 0){
                    msg.edit(`*${user.name}* has no searchable messages.`);
                }else{
                    const lastMessage = res.messages.matches[0];
                    msg.edit(`*${user.name}* last sent a message at \`${new Date(lastMessage.ts * 1000).toLocaleString()}\` ${(lastMessage.channel.name.isValidSlackId()) ? 'in a private conversation.' : `in *#${lastMessage.channel.name}*. He said:\`\`\`${lastMessage.text}\`\`\``}`);
                }
            }catch (e){
                msg.reply(`Could not get last message for *${lookup}* due to an error:\`\`\`${e}\`\`\``);
            }
        }



        if(lookup.isValidSlackMention()){
            // It's a slack mention
            const id = lookup.getSlackIdFromMention();

            if(!id){
                msg.delete();
                bot.chat(msg.user.id, `${lookup} doesn't appear to be a valid slack mention.`);
                return;
            }

            try{
                getLastMessage(await bot.api.storage.users.get(id)).catch(log.error);
            }catch (err){
                msg.reply(`Couldn't get user info for ${user}: \`\`\`${err}\`\`\``);
            }
        }else{
            // It's a username
            getLastMessage({name: lookup.toLowerCase()}).catch(log.error);
        }
    }
}

module.exports = LastMessageCommand;