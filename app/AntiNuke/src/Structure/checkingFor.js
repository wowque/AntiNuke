const moment = require('moment');
const appearance = require('../../../../appearance.json'); 
const { getAvatar } = require('../Structure/getAttribute');
const { errorEmbed } = require('../Structure/embedGenerator.js');


function checkingForNumber(value) {

    return  isFinite(value) && value === parseInt(value, 10);

};

async function checkingForBot (client, member, pickMember, interaction) { 

    if (pickMember.user.bot) 
    return interaction.reply({
        ephemeral: true,
        embeds: [
            await errorEmbed (client, member, `**данную** команду, Вы **не можете** использовать на боте ${pickMember}`)
        ], 
        components: [

        ]
    }).catch(() => {});

};

function checkingForAvailability (db, member) { 

    const configDbList = {
        "users": {
            "type": "member",
            "zeroing": false,
            "path": "./../../db/AntiNuke/users.json",
            "pathBackup": "./../../db/AntiNuke/BACKUP/users.json",
            "scheme": {
                "Groups": [],
                "Roles ": [],
                "Warnings": 0,
                "Quarantine": false
            }
        },
        "access": {
            "type": "guild",
            "zeroing": false,
            "path": "./../../db/AntiNuke/access.json",
            "pathBackup": "./../../db/AntiNuke/BACKUP/access.json",
            "scheme": {
                "Groups": [],
                "Actions": [],
                "Defualt": false
            }
        }
    };

    for (const DataBase in db) {

        const dbMain = db[DataBase.toString()];
        if(configDbList[DataBase.toString()].type == 'member') {

            if (!dbMain[member.id]) dbMain[member.id] = configDbList[DataBase.toString()].scheme;

        }

        if(configDbList[DataBase.toString()].type == 'guild') {

            if (!dbMain[member.guild.id]) dbMain[member.guild.id] = configDbList[DataBase.toString()].scheme;

        }

    }

    return;

};

function checkingForAvailabilityGuild (db, guild) { 

    const configDbList = {
        "users": {
            "type": "member",
            "zeroing": false,
            "path": "./../../db/AntiNuke/users.json",
            "pathBackup": "./../../db/AntiNuke/BACKUP/users.json",
            "scheme": {
                "Groups": [],
                "Roles ": [],
                "Warnings": 0,
                "Quarantine": false
            }
        },
        "access": {
            "type": "guild",
            "zeroing": false,
            "path": "./../../db/AntiNuke/access.json",
            "pathBackup": "./../../db/AntiNuke/BACKUP/access.json",
            "scheme": {
                "Groups": [],
                "Actions": [],
                "Defualt": false
            }
        }
    };

    for (const DataBase in db) {

        const dbMain = db[DataBase.toString()];

        if(configDbList[DataBase.toString()].type == 'guild') {

            if (!dbMain[guild.id]) dbMain[guild.id] = configDbList[DataBase.toString()].scheme;

        };

    };

    return;

};

async function checkingForRoles (i, roles) { 

    let rolesTxt = '';
    let memberIfRole = false;
    const memberRoles = i.member._roles;

    for (let a = 0; a < memberRoles.length; a++) if(roles.includes(memberRoles[a])) memberIfRole = true;
    for (let a = 0; a < roles.length; a++) rolesTxt += ` <@&${roles[a]}>`;
        
    if (!memberIfRole) 
    return i.reply({
        ephemeral: true,  
        embeds: [
            {
                title: `${i.client.user.username} error`,
                color: appearance.embed.errorColor,
                description: `${i.member}, Данную команду могут **использовать** только пользователи с **ролью**:${rolesTxt}`,                          
                thumbnail: { url: await getAvatar (i.member) } 
            }
        ]
    }).catch(() => {});

    return;

};

async function сheckingForOnline (db, member) { 
    
    const { users, online, pt } = db;

    const today = new Date();
    const comandtime = Date.now() / 1000;
    const tomor = comandtime + ( 24 * 60 * 60 );

    const lastTime = tomor - ( today.getHours() * 60 * 60 + today.getMinutes() * 60 );

    const endOfWeek = moment().endOf('week').toDate();
    const lastDay = ( endOfWeek.getTime() / 1000 ) + ( 24 * 60 * 60 );
    
    checkingForAvailability (db, member);

    if((online[member.id].Day.Zeroing - comandtime) < 0) {

        online[member.id].Day.Pt = 0;
        online[member.id].Day.Count = 0;
        online[member.id].Day.Zeroing = lastTime;
        online[member.id].Day.History = [];
        
    };

    if((online[member.id].Week.Zeroing - comandtime) < 0) {

        online[member.id].Week.Pt = 0;
        online[member.id].Week.Count = 0;
        online[member.id].Week.Zeroing = lastDay;
        online[member.id].Week.History = [];
    };

    if((users[member.id].Stats.Day.Zeroing - comandtime) < 0) {

        users[member.id].Stats.Day.Count = 0;
        users[member.id].Stats.Day.Zeroing = lastTime;
        users[member.id].Stats.Day.History = [];
        
    };

    if((users[member.id].Stats.Week.Zeroing - comandtime) < 0) {

        users[member.id].Stats.Week.Count = 0;
        users[member.id].Stats.Week.Zeroing = lastDay;
        users[member.id].Stats.Week.History = [];
    };

};

module.exports.checkingForNumber= checkingForNumber;
module.exports.checkingForBot = checkingForBot;
module.exports.checkingForRoles = checkingForRoles;
module.exports.сheckingForOnline = сheckingForOnline;
module.exports.checkingForAvailability = checkingForAvailability;
module.exports.checkingForAvailabilityGuild = checkingForAvailabilityGuild;