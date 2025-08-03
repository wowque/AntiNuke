const guildСonfig = require('../../../../guild.json');  
const { customButton } = require('../Structure/buttonGenerator.js');
const { checkingForAvailability } = require('../Structure/checkingFor');


module.exports = async (client, appearance, config, db) => {

    if (client) {
    
        const botsLogs = await client.channels.fetch(guildСonfig.botslogs).catch(() => {});
        const botAvatar = await client.user.avatarURL({ dynamic: true, size: 512 });
        

        console.log(`\x1b[32m[INFORM]\x1b[0m Приложение: \x1b[33m${client.user.tag}\x1b[0m, Websocket(Host) heartbeat: ${client.ws.ping}ms. ヾ(•ω•\`)o`);
        console.log(`\x1b[32m[READY]\x1b[0m Приложение: \x1b[33m${client.user.tag}\x1b[0m, успешно запущено. (⊙_◎)`);
        
    };

};