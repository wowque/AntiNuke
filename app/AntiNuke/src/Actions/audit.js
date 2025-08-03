const botsСonfig = require('../../../../bots.json');  
const { Client } = require('discord.js-selfbot-v13');
const guildСonfig = require('../../../../guild.json');  
const { PermissionsBitField, CommandInteractionOptionResolver } = require('discord.js');  
const { getAvatar } = require('../Structure/getAttribute.js');
const { makeid } = require('../Structure/numbersGenerator.js');
const { getCurrentDateTime } = require('../Structure/timeManage.js');
const { checkingForAvailability, checkingForAvailabilityGuild } = require('../Structure/checkingFor.js');


module.exports = async (client, appearance, config, db) => {
  
    const { users, access } = db;    
    const guild = await client.guilds.fetch(appearance.guild).catch(() => {});
    await checkingForAvailabilityGuild (db, guild);

    if (!access[guild.id].Default) {

        /*
        0 - Игнорировать
        1 - Отмена
        2 - Предупреждение
        3 - Предупреждение + Отмена
        4 - Карантин
        5 - Карантин + Отмена
        */

        let idGroup = makeid (20);
        access[idGroup] = {

            name: 'Defualt',
            everyone: true,
            canDelete: false,

            warningsTime: 3600,
            warnings: 5,

            members: [],

            permitions: {
                createChannel: {
                    name: 'Создание канала',
                    event: 'createChannel',
                    action: 5
                },
                deleteChannel: {
                    name: 'Удаление канала',
                    event: 'deleteChannel',
                    action: 5
                },
                editChannel: {
                    name: 'Изменение канала',
                    event: 'editChannel',
                    action: 5
                },
                createRole: {
                    name: 'Создание роли',
                    event: 'createRole',
                    action: 5
                },
                deleteRole: {
                    name: 'Удаление роли',
                    event: 'deleteRole',
                    action: 5
                },
                editRole: {
                    name: 'Изменение роли',
                    event: 'editRole',
                    action: 5
                },
                editRoleAdmin: {
                    name: 'Изменение роли с правами администратора',
                    event: 'editRoleAdmin',
                    action: 5
                },
                addRole: {
                    name: 'Выдача роли',
                    event: 'addRole',
                    action: 3
                },
                removeRole: {
                    name: 'Снятие роли',
                    event: 'removeRole',
                    action: 3
                },
                addRoleAdmin: {
                    name: 'Выдача роли с правами администратора',
                    event: 'addRoleAdmin',
                    action: 5
                },
                removeRoleAdmin: {
                    name: 'Снятие роли с правами администратора',
                    event: 'removeRoleAdmin',
                    action: 5
                },
                editNickname: {
                    name: 'Изменение никнейма',
                    event: 'editNickname',
                    action: 3
                },
                timeout: {
                    name: 'Тайм-аут пользователя',
                    event: 'timeout',
                    action: 5
                },
                kick: {
                    name: 'Кик пользователя',
                    event: 'kick',
                    action: 5
                },
                ban: {
                    name: 'Бан пользователя',
                    event: 'ban',
                    action: 5
                },
                unban: {
                    name: 'Разбан пользователя',
                    event: 'unban',
                    action: 5
                },
                editGuild: {
                    name: 'Изменение сервера',
                    event: 'editGuild',
                    action: 5
                },
                editGuildLink: {
                    name: 'Изменение ссылки сервера',
                    event: 'editGuildLink',
                    action: 5
                },
                addBot: {
                    name: 'Добавление бота',
                    event: 'addBot',
                    action: 5
                },
                editSticker: {
                    name: 'Действие со стикерами',
                    event: 'editSticker',
                    action: 5
                },
                editEmoji: {
                    name: 'Действие с эмоджи',
                    event: 'editEmoji',
                    action: 5
                },
                editWebhook: {
                    name: 'Действие с Webhook',
                    event: 'editWebhook',
                    action: 5
                },
                ping: {
                    name: 'Упоминание @everyone/@here/ролей',
                    event: 'ping',
                    action: 5
                }
            }

        };

        access[guild.id].Default = idGroup;

    };
    
    async function getAudit (type, target, typeRequest, changesNames) {

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 5,
            type: type
        });

      
        if (fetchedLogs) {

            let lastEn = false;
            let members = false;
            for await (const pickEntries of fetchedLogs.entries) {
    
                if (!members) {

                    if (typeRequest == 'channelId' && target && pickEntries[1].target.channelId == target || !typeRequest && target && pickEntries[1].target.id == target || !target) {
                        
                        members = await guild.members.fetch(pickEntries[1].executor.id).catch(() => {});
                        lastEn = pickEntries[1];

                    };

                };

            };

            return [members, lastEn];

        };

    };

    async function getAccess (action, member) {

        checkingForAvailability (db, member);

        let permisionsOther = {};
        let permisions = access[access[guild.id].Default].permitions;
        for (const pickGroup in users[member.id].Groups) {

            let fetchPickGroup = access[users[member.id].Groups[pickGroup]];
            for (let pickPermission in fetchPickGroup.permitions) if (!permisionsOther[pickPermission]) permisionsOther[pickPermission] = {action: permisions[pickPermission].action};
            for (let pickPermission in fetchPickGroup.permitions) if (fetchPickGroup.permitions[pickPermission].action < permisionsOther[pickPermission].action) permisionsOther[pickPermission].action = fetchPickGroup.permitions[pickPermission].action;

        };

        for (pickRole in member._roles) {

            if (!users[member._roles[pickRole]]) {

                const pickRoleFetch = await guild.roles.fetch(member._roles[pickRole]).catch(() => {});
                checkingForAvailability (db, pickRoleFetch);

            };

            for (const pickGroup in users[member._roles[pickRole]].Groups) {

                let fetchPickGroup = access[users[member._roles[pickRole]].Groups[pickGroup]];
                for (let pickPermission in fetchPickGroup.permitions) if (!permisionsOther[pickPermission]) permisionsOther[pickPermission] = {action: permisions[pickPermission].action};
                for (let pickPermission in fetchPickGroup.permitions) if (fetchPickGroup.permitions[pickPermission].action < permisionsOther[pickPermission].action) permisionsOther[pickPermission].action = fetchPickGroup.permitions[pickPermission].action;
    
            };

        };
        
        if (!permisionsOther[action]) permisionsOther[action] = {action: permisions[action].action};
        if (guildСonfig.owners.includes(member.id) || member.id == client.user.id) permisionsOther[action].action = 0;


        const memberHRole = member.roles.highest;
        const clientOfGuild = await guild.members.fetch(client.user.id).catch(() => {});
        const clientHRole = clientOfGuild.roles.highest;

        if (clientHRole.rawPosition <= memberHRole.rawPosition) permisionsOther[action].action = 0;


        if (guild.ownerId == member.id) permisionsOther[action].action = 0;

        let values = [];
        let bestMatch = access[access[guild.id].Default];
        let bestRatio = access[access[guild.id].Default].warnings / access[access[guild.id].Default].warningsTime;

        for (const pickGroup in users[member.id].Groups) values.push(access[users[member.id].Groups[pickGroup]]);
        for (pickRole in member._roles) for (const pickGroup in users[member._roles[pickRole]].Groups) values.push(access[users[member._roles[pickRole]].Groups[pickGroup]]);
        
        values.forEach(obj => {

            const ratio = obj.warnings / obj.warningsTime;

            if (ratio > bestRatio) {

                bestRatio = ratio;
                bestMatch = obj;

            };
    
        });

        return [permisionsOther[action].action, bestMatch];

    };

    async function quarantine (member, accessOfMember, name, target) {

        const antinukeLogs = await client.channels.fetch(appearance.channels.AntiNuke.logs).catch(() => {});
        if (users[member.id].Roles == false && member._roles !== appearance.roles.AntiNuke.quarantine) users[member.id].Roles = member._roles;
        users[member.id].Quarantine = { Date: Date.now()/1000, Reason: name };

        let rolesRemove = [];
        const memberRoles = member._roles;
        for (let role of member._roles) if (role !== appearance.roles.AntiNuke.boost) rolesRemove.push(role);
        setTimeout(() => {member.roles.remove(rolesRemove).catch(console.error)}, 200);

        if (antinukeLogs) {

            const quarantineMessage = await antinukeLogs.send({  
                embeds: [
                    {
                        title: `${client.user.username + ' logs'}`,
                        color: appearance.embed.color,
                        description: `\`\`\`${name}\`\`\``,
                        thumbnail: { url: await getAvatar(member) },
                        fields: target ? [
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                value: `・${member}\n・${member.id}`,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                value: `${target}`,
                                inline: false
                            }
                        ]
                        :
                        [
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                value: `・${member}\n・${member.id}`,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                inline: true
                            }
                        ],
                        footer: {
                            text: `Статус: Карантин`,
                        }
                    }   
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2, 
                                style: 3, 
                                customId: 'unquarantine', 
                                label: 'Снять карантин'
                            }
                        ]
                    }
                ]
            }).catch(() => {});
    
            const collectors = await quarantineMessage.createMessageComponentCollector();
            collectors.on('collect', async i => {
        
                if (!guildСonfig.owners.includes(i.member.id)) return i.reply({ephemeral: true, content: '🖕'}).catch(() => {}); 
    
                switch (i.customId) { 
        
                    case 'unquarantine': { 
    
                        if (!users[member.id].Quarantine) return i.update({  
                            embeds: [
                                {
                                    title: `${client.user.username + ' logs'}`,
                                    color: appearance.embed.color,
                                    description: `\`\`\`${name}\`\`\``,
                                    thumbnail: { url: await getAvatar(member) },
                                    fields: target ? [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                            value: `${target}`,
                                            inline: false
                                        }
                                    ]
                                    :
                                    [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        }
                                    ]
                                }
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 4, 
                                            customId: 'unquarantine', 
                                            label: 'Карантин отменен',
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => {});

                        member.roles.add(memberRoles).catch(() => {});
                    
                        users[member.id].Quarantine = false;
                        users[member.id].Roles = false;
    
                        i.update({  
                            embeds: [
                                {
                                    title: `${client.user.username + ' logs'}`,
                                    color: appearance.embed.color,
                                    description: `\`\`\`${name}\`\`\``,
                                    thumbnail: { url: await getAvatar(member) },
                                    fields: target ? [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                            value: `${target}`,
                                            inline: false
                                        }
                                    ]
                                    :
                                    [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Карантин${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        }
                                    ],
                                    footer: {
                                        text: `Отменено: ${i.user.username}`,
                                        icon_url: await getAvatar(i.member)
                                    }
                                }
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 3, 
                                            customId: 'unquarantine', 
                                            label: 'Карантин снят',
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => {});
                        
                    }
    
                };
    
            });

        };

    };

    async function warning (member, accessOfMember, name, target) {

        if (users[member.id].Warnings < 0) users[member.id].Warnings = 0;

        const antinukeLogs = await client.channels.fetch(appearance.channels.AntiNuke.logs).catch(() => {});
        const dateEnd = Math.floor(Date.now()/1000 + accessOfMember[1].warningsTime);
        users[member.id].Warnings++;

        let numberAction = makeid(5);
        let parametersOfWarn = {
            Date: Date.now()/1000,
            DateEnd: dateEnd, 
            Member: member.id,
            ID: numberAction
        };

        access[guild.id].Actions.push(parametersOfWarn);
        
        let Warns = users[member.id].Warnings;
        let MaxWarns = accessOfMember[1].warnings;

        if (antinukeLogs) {

            const warnMessage = await antinukeLogs.send({  
                embeds: [
                    {
                        title: `${client.user.username + ' logs'}`,
                        color: appearance.embed.color,
                        description: `\`\`\`${name}\`\`\``,
                        thumbnail: { url: await getAvatar(member) },
                        fields: target ? [
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                value: `・${member}\n・${member.id}`,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                value: `\`\`\`Предупреждение ${Warns}/${MaxWarns}${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                value: `${target}`,
                                inline: false
                            }
                        ]
                        :
                        [
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                value: `・${member}\n・${member.id}`,
                                inline: true
                            },
                            {
                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                value: `\`\`\`Предупреждение ${Warns}/${MaxWarns}${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                inline: true
                            }
                        ],
                        footer: {
                            text: `Закончится ${getCurrentDateTime (dateEnd)}`, 
                        }
                    }   
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2, 
                                style: 1, 
                                customId: 'unwarn', 
                                label: 'Снять предупреждение'
                            }
                        ]
                    }
                ]
            }).catch(() => {});

            const collectors = await warnMessage.createMessageComponentCollector();
            collectors.on('collect', async i => {
        
                if (!guildСonfig.owners.includes(i.member.id)) return i.reply({ephemeral: true, content: '🖕'}).catch(() => {}); 
    
                switch (i.customId) { 
        
                    case 'unwarn': { 
    
                        for (let pickAction in access[guild.id].Actions) if (access[guild.id].Actions[pickAction] && access[guild.id].Actions[pickAction].ID == numberAction) {
    
                            users[member.id].Warnings--;
                            access[guild.id].Actions = access[guild.id].Actions.filter((n) => { return n != parametersOfWarn });
    
                        };
    
    
                        i.update({  
                            embeds: [
                                {
                                    title: `${client.user.username + ' logs'}`,
                                    color: appearance.embed.color,
                                    description: `\`\`\`${name}\`\`\``,
                                    thumbnail: { url: await getAvatar(member) },
                                    fields: target ? [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Предупреждение ${Warns}/${MaxWarns}${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                            value: `${target}`,
                                            inline: false
                                        }
                                    ]
                                    :
                                    [
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                            value: `・${member}\n・${member.id}`,
                                            inline: true
                                        },
                                        {
                                            name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                            value: `\`\`\`Предупреждение ${Warns}/${MaxWarns}${accessOfMember[0] == 1 || accessOfMember[0] == 3 || accessOfMember[0] == 5 ? ' + Отмена' : ''}\`\`\``,
                                            inline: true
                                        }
                                    ],
                                    footer: {
                                        text: `Отменено: ${i.user.username}`,
                                        icon_url: await getAvatar(i.member)
                                    }
                                }   
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 1, 
                                            customId: 'unwarn', 
                                            label: 'Предупреждение снято',
                                            disabled: true
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => {});
                        
                    }
    
                };
    
            });

        };

        if (users[member.id].Warnings >= accessOfMember[1].warnings) {

            if (users[member.id].Roles == false && member._roles !== appearance.roles.AntiNuke.quarantine) users[member.id].Roles = member._roles;
            users[member.id].Quarantine = { Date: Date.now()/1000, Reason: 'Максимальное кол-во предупреждений' };

            let rolesRemove = [];
            const memberRoles = member._roles;
            for (let role of member._roles) if (role !== appearance.roles.AntiNuke.boost) rolesRemove.push(role);
            setTimeout(() => {member.roles.remove(rolesRemove).catch(console.error)}, 200);

            let Warns = users[member.id].Warnings;
            let MaxWarns = accessOfMember[1].warnings;
            for (let pickAction in access[guild.id].Actions) if (access[guild.id].Actions[pickAction] && access[guild.id].Actions[pickAction].Member && access[guild.id].Actions[pickAction].Member == member.id) access[guild.id].Actions = access[guild.id].Actions.filter((n) => { return n != access[guild.id].Actions[pickAction] });
            users[member.id].Warnings = 0;

            if (antinukeLogs) {

                const quarantineMessage = await antinukeLogs.send({  
                    embeds: [
                        {
                            title: `${client.user.username + ' logs'}`,
                            color: appearance.embed.color,
                            description: `\`\`\`Максимальное кол-во предупреждений\`\`\``,
                            thumbnail: { url: await getAvatar(member) },
                            fields: [
                                {
                                    name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                    value: `・${member}\n・${member.id}`,
                                    inline: true
                                },
                                {
                                    name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                    value: `\`\`\`Карантин\`\`\``,
                                    inline: true
                                },
                                {
                                    name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                    value: `・Предупреждений: **${Warns}**/**${MaxWarns}**`,
                                    inline: false
                                }
                            ],
                            footer: {
                                text: `Статус: Карантин`,
                            }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 3, 
                                    customId: 'unquarantine', 
                                    label: 'Снять карантин'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});
    
                const collectors = await quarantineMessage.createMessageComponentCollector();
                collectors.on('collect', async i => {
            
                    if (!guildСonfig.owners.includes(i.member.id)) return i.reply({ephemeral: true, content: '🖕'}).catch(() => {}); 
        
                    switch (i.customId) { 
            
                        case 'unquarantine': { 
    
                            if (!users[member.id].Quarantine) return i.update({  
                                embeds: [
                                    {
                                        title: `${client.user.username + ' logs'}`,
                                        color: appearance.embed.color,
                                        description: `\`\`\`Максимальное кол-во предупреждений\`\`\``,
                                        thumbnail: { url: await getAvatar(member) },
                                        fields: [
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                                value: `・${member}\n・${member.id}`,
                                                inline: true
                                            },
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                                value: `\`\`\`Карантин\`\`\``,
                                                inline: true
                                            },
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                                value: `・Предупреждений: **${Warns}**/**${MaxWarns}**`,
                                                inline: false
                                            }
                                        ]
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2, 
                                                style: 4, 
                                                customId: 'unquarantine', 
                                                label: 'Карантин отменен',
                                                disabled: true
                                            }
                                        ]
                                    }
                                ]
                            }).catch(() => {});

                            member.roles.add(memberRoles).catch(() => {});
    
                            users[member.id].Quarantine = false;
                            users[member.id].Roles = false;
        
                            i.update({  
                                embeds: [
                                    {
                                        title: `${client.user.username + ' logs'}`,
                                        color: appearance.embed.color,
                                        description: `\`\`\`Максимальное кол-во предупреждений\`\`\``,
                                        thumbnail: { url: await getAvatar(member) },
                                        fields: [
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Пользователь:`,
                                                value: `・${member}\n・${member.id}`,
                                                inline: true
                                            },
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Действие:`,
                                                value: `\`\`\`Карантин\`\`\``,
                                                inline: true
                                            },
                                            {
                                                name: `${appearance.embed.dot || appearance.emoji.Dot}Цель:`,
                                                value: `・Предупреждений: **${Warns}**/**${MaxWarns}**`,
                                                inline: false
                                            }
                                        ],
                                        footer: {
                                            text: `Отменено: ${i.user.username}`,
                                            icon_url: await getAvatar(i.member)
                                        }
                                    }
                                ],
                                components: [
                                    {
                                        type: 1,
                                        components: [
                                            {
                                                type: 2, 
                                                style: 3, 
                                                customId: 'unquarantine', 
                                                label: 'Карантин снят',
                                                disabled: true
                                            }
                                        ]
                                    }
                                ]
                            }).catch(() => {});
                            
                        }
        
                    };
        
                });

            };

        };

    };

      
    client.on('roleCreate', async role => {

        let name = 'Создание роли';
        let target = `・${role.name}`;
        const audit = await getAudit (30, role.id);
        const member = audit[0];
        
        if (member) {

            if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

            async function cancel () {

                role.delete().catch(() => {});

            };

            const accessOfMember = await getAccess ('createRole', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('roleDelete', async role => {

        let name = 'Удаление роли';
        let target = `・${role.name}\n・#${role.color}`;
        const audit = await getAudit (32, role.id);
        const member = audit[0];

        if (member) {
       
            if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

            async function cancel () {

                await guild.roles.create(
                    {
                        name: role.name,
                        color:  role.color, 
                        hoist:  role.hoist, 
                        position:  role.rawPosition, 
                        permissions: role.permissions,
                        mentionable: role.mentionable,
                        managed: role.managed,
                        reason: `Восстановление роли`,
                    }
                ).catch(() => {});

            };

            const accessOfMember = await getAccess ('deleteRole', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('roleUpdate', async (oldRole, newRole) => {

        if (newRole.permissions.has(PermissionsBitField.Flags.Administrator) || oldRole.permissions.has(PermissionsBitField.Flags.Administrator)) {

            let name = 'Изменение роли с правами администратора';
            let target = `・${newRole}\n・${newRole.id}`;
            const audit = await getAudit (31, newRole.id);
            const member = audit[0];
            
            if (member) {

                if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
    
                async function cancel () {
    
                    newRole.edit(
                        {
                            name: oldRole.name,
                            color:  oldRole.color, 
                            hoist:  oldRole.hoist, 
                            position:  oldRole.rawPosition, 
                            permissions: oldRole.permissions,
                            mentionable: oldRole.mentionable,
                            managed: oldRole.managed,
                            reason: `Восстановление роли`,
                        }
                    ).catch(() => {});
    
                };
    
                const accessOfMember = await getAccess ('editRoleAdmin', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        }

        else {

            let name = 'Изменение роли';
            let target = `・${newRole}\n・${newRole.id}`;
            const audit = await getAudit (31, newRole.id);
            const member = audit[0];
            
            if (member) {

                if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;
    
                async function cancel () {
    
                    newRole.edit(
                        {
                            name: oldRole.name,
                            color:  oldRole.color, 
                            hoist:  oldRole.hoist, 
                            position:  oldRole.rawPosition, 
                            permissions: oldRole.permissions,
                            mentionable: oldRole.mentionable,
                            managed: oldRole.managed,
                            reason: `Восстановление роли`,
                        }
                    ).catch(() => {});
    
                };
    
                const accessOfMember = await getAccess ('editRole', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                }
    
            };

        };

    });

      
    client.on('channelCreate', async channel => {

        let name = 'Создание канала';
        let target = `・${channel.name}`;
        const audit = await getAudit (10, channel.id);
        const member = audit[0];
        
        if (member) {

            if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

            async function cancel () {

                channel.delete().catch(() => {});

            };

            const accessOfMember = await getAccess ('createChannel', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('channelDelete', async channel => {

        let name = 'Удаление канала';
        let target = `・${channel.name}`;
        const audit = await getAudit (12, channel.id);
        const member = audit[0];
        
        if (member) {

            if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

            async function cancel () {

                await guild.channels.create(
                    {
                        type: channel.type,
                        name: channel.name,
                        nsfw:  channel.nsfw, 
                        topic:  channel.topic, 
                        parent:  channel.parentId, 
                        permissions: channel.permissions,
                        position: channel.rawPosition,
                        reason: `Восстановление канала`
                    }
                ).catch(() => {});

            };

            const accessOfMember = await getAccess ('deleteChannel', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('channelUpdate', async (oldChannel, newChannel) => {

        let name = 'Изменение канала';
        let target = `・${newChannel}\n・${newChannel.id}`;
        const audit = await getAudit (11, newChannel.id);
        const member = audit[0];

        if (member) {      

            if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return;

            async function cancel () {

                newChannel.edit(
                    {
                        type: oldChannel.type,
                        name: oldChannel.name,
                        nsfw:  oldChannel.nsfw, 
                        topic:  oldChannel.topic, 
                        parent:  oldChannel.parentId, 
                        permissions: oldChannel.permissions,
                        position: oldChannel.rawPosition,
                        reason: `Восстановление канала`
                    }
                ).catch(() => {});

            };

            const accessOfMember = await getAccess ('editChannel', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });


    client.on('guildMemberAdd', async (member) => {

        if (member.user.bot) {

            let name = 'Добавление бота';
            let target = `・${member}\n・${member.id}`;
            const audit = await getAudit (28, member.id);
            const memberOfAudit = audit[0];
            
            if (memberOfAudit) {
    
                async function cancel () {

                    await member.kick().catch(() => {});
    
                };
    
                const accessOfMember = await getAccess ('addBot', memberOfAudit);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (memberOfAudit, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (memberOfAudit, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (memberOfAudit, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (memberOfAudit, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        };

    });

    client.on('guildMemberUpdate', async (oldMember, newMember) => {

        if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {

            let name = 'Тайм-аут пользователя';
            let target = `・${newMember}\n・${newMember.id}`;
            const audit = await getAudit (24, newMember.id);
            const member = audit[0];
            
            if (member) {
    
                async function cancel () {

                    newMember.timeout(oldMember.communicationDisabledUntilTimestamp, 'Восстановление').catch(() => {});

                };
    
                const accessOfMember = await getAccess ('timeout', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        };

        if (oldMember.nickname !== newMember.nickname) {

            let name = 'Изменение никнейма';
            let target = `・${newMember}\n・${newMember.id}`;
            const audit = await getAudit (24, newMember.id);
            const member = audit[0];
            
            if (member && member.id !== newMember.id) {
    
                async function cancel () {

                    newMember.setNickname(oldMember.nickname, 'Восстановление').catch(() => {});

                };
    
                const accessOfMember = await getAccess ('editNickname', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        };

        if (oldMember._roles !== newMember._roles) {

            if (newMember._roles.length > oldMember._roles.length) {

                let name = 'Выдача роли';
                const role = newMember._roles.filter(pickRole => !oldMember._roles.includes(pickRole));

                let rolesList = '';
                let rolesList2 = '';
                let adminPerm = false;
                for (pickRole in role) {

                    const roleFetch = await guild.roles.fetch(role[pickRole]).catch(() => {});
                    if (roleFetch) {

                        if (rolesList == '') rolesList += `${roleFetch}`;
                        else rolesList += `, ${roleFetch}`;

                        if (rolesList2 == '') rolesList2 += `${roleFetch.id}`;
                        else rolesList2 += `, ${roleFetch.id}`;

                        if (roleFetch && roleFetch.permissions && roleFetch.permissions.has(PermissionsBitField.Flags.Administrator)) {
    
                            name += ' с правами администратора';
                            adminPerm = true;
    
                        };

                    };

                };

                let target = `・${newMember}\n・${newMember.id}\n\n・${rolesList}\n・${rolesList2}`;
                const audit = await getAudit (25, newMember.id);
                const member = audit[0];
                
                if (member) {

                    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return; 
        
                    async function cancel () {

                        for (pickRole in role) {

                            if (newMember.id !== member.id) newMember.roles.remove(role[pickRole], 'Восстановление').catch(() => {});
                            else setTimeout(() => {if (users[member.id].Roles) users[member.id].Roles = users[member.id].Roles.filter((n) => { return n != role[pickRole] })}, 3000);

                        };

                    };
        
                    const accessOfMember = !adminPerm ? await getAccess ('addRole', member) : await getAccess ('addRoleAdmin', member);
                    switch (accessOfMember[0]) {
        
                        case 0: break;
        
                        case 1: {
                            
                            await cancel ();
                            break;
        
                        }
        
                        case 2: {
                            
                            await warning (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 3: {
                            
                            await cancel ();
                            await warning (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 4: {
                            
                            await quarantine (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 5: {
                            
                            await cancel ();
                            await quarantine (member, accessOfMember, name, target);
                            break;
        
                        }
        
                    };
        
                };

            }

            else if (newMember._roles.length < oldMember._roles.length) {

                let name = 'Снятие роли';
                const role = oldMember._roles.filter(pickRole => !newMember._roles.includes(pickRole));


                let rolesList = '';
                let rolesList2 = '';
                let adminPerm = false;
                for (pickRole in role) {

                    const roleFetch = await guild.roles.fetch(role[pickRole]).catch(() => {});
                    if (roleFetch) {

                        if (rolesList == '') rolesList += `${roleFetch}`;
                        else rolesList += `, ${roleFetch}`;

                        if (rolesList2 == '') rolesList2 += `${roleFetch.id}`;
                        else rolesList2 += `, ${roleFetch.id}`;

                        if (roleFetch && roleFetch.permissions && roleFetch.permissions.has(PermissionsBitField.Flags.Administrator)) {
    
                            name += ' с правами администратора';
                            adminPerm = true;
    
                        };

                    };

                };

                let target = `・${newMember}\n・${newMember.id}\n\n・${rolesList}\n・${rolesList2}`;
                const audit = await getAudit (25, newMember.id);
                const member = audit[0];
                
                if (member) {

                    if (role.length <= 3 && member.id == newMember.id) return;
        
                    async function cancel () {

                        for (pickRole in role) {

                            if (newMember.id !== member.id) newMember.roles.add(role[pickRole], 'Восстановление').catch(() => {});
                            else setTimeout(() => {if (users[member.id].Roles) users[member.id].Roles.push(role[pickRole])}, 3000);

                        };

                    };

                    const accessOfMember = !adminPerm ? await getAccess ('removeRole', member) : await getAccess ('removeRoleAdmin', member);
                    switch (accessOfMember[0]) {
        
                        case 0: break;
        
                        case 1: {
                            
                            await cancel ();
                            break;
        
                        }
        
                        case 2: {
                            
                            await warning (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 3: {
                            
                            await cancel ();
                            await warning (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 4: {
                            
                            await quarantine (member, accessOfMember, name, target);
                            break;
        
                        }
        
                        case 5: {
                            
                            await cancel ();
                            await quarantine (member, accessOfMember, name, target);
                            break;
        
                        }
        
                    };
        
                };

            };

        };

    });
      
    client.on('guildMemberRemove', async (member) => {

        let name = 'Кик пользователя';
        let target = `・${member}\n・${member.id}`;
        const audit = await getAudit (20, member.id);
        const memberOfAudit = audit[0];
        
        if (memberOfAudit) {

            async function cancel () {

            };

            const accessOfMember = await getAccess ('kick', memberOfAudit);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (memberOfAudit, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (memberOfAudit, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (memberOfAudit, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (memberOfAudit, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('guildBanAdd', async (ban) => {

        let name = 'Бан пользователя';
        let target = `・${ban.user}\n・${ban.user.id}`;
        const audit = await getAudit (22, ban.user.id);
        const member = audit[0];

        if (member) {
        
            if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;

            async function cancel () {

                ban.guild.bans.remove(ban.user.id).catch(() => {});

            };

            const accessOfMember = await getAccess ('ban', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      
    client.on('guildBanRemove', async (ban) => {

        let name = 'Разбан пользователя';
        let target = `・${ban.user}\n・${ban.user.id}`;
        const audit = await getAudit (23, ban.user.id);
        const member = audit[0];
        
        if (member) {
        
            if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;

            async function cancel () {

            };

            const accessOfMember = await getAccess ('unban', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      

    client.on('guildUpdate', async (oldGuild, newGuild) => {
 
        if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {

            let name = 'Изменение сслыки';
            let target = `・https://discord.gg/${newGuild.vanityURLCode}\n・**${newGuild.vanityURLCode}**`;
            const audit = await getAudit (1, newGuild.id);
            const member = audit[0];
            
            if (member) {

                if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return;
    
                async function cancel () {
                    
                    async function setCodeOfGuild (guild, code) {

                        const antinukeLogs = await client.channels.fetch(appearance.channels.AntiNuke.logs).catch(() => {});
                
                        const clientOfMember = new Client( { checkUpdate: false } );
                        clientOfMember.on('ready', async () => {
                
                            if (clientOfMember) {
                    
                                const guildOfLink = await clientOfMember.guilds.fetch(guild.id).catch(() => {});
                                if (!guildOfLink) return antinukeLogs.send({  
                                    embeds: [
                                        {
                                            title: `${client.user.username + ' logs'}`,
                                            color: appearance.embed.errorColor,
                                            description: `\`\`\`Восстановление ссылки приглашения\`\`\``,
                                            thumbnail: { url: await getAvatar(member) },
                                            fields: [
                                                {
                                                    name: `${appearance.embed.dot || appearance.emoji.Dot}Сервер:`,
                                                    value: `・**${newGuild.name}**\n・${newGuild.id}`,
                                                    inline: true
                                                },
                                                {
                                                    name: `${appearance.embed.dot || appearance.emoji.Dot}Ссылка:`,
                                                    value: `\`\`\`${oldGuild.vanityURLCode}\`\`\``,
                                                    inline: true
                                                }
                                            ]
                                        }   
                                    ],
                                    components: [

                                    ]
                                }).catch(() => {});
                    
                                guildOfLink.setVanityCode(code)
                                    .then(async () => {

                                        return clientOfMember.destroy().catch(() => {});
                            
                                    })

                                    .catch(async (err) => {

                                        return clientOfMember.destroy().catch(() => {});
                            
                                    });
                    
                            };
                
                        });
                
                        await clientOfMember.login(botsСonfig.SelfAntiNuke.token) 
                            .catch(async (error) => {
                            
                                await antinukeLogs.send(`⚠️ Произошла **какая-то** ошибка при заходе на аккаунт!\nОшибка: ${error}`);
                                return;
                    
                            });
                
                
                    };
                    
                    await setCodeOfGuild (guild, oldGuild.vanityURLCode);

                    // async function setVanityURL (guild, token, code) {
                
                    //     const requestAudit = request.patch(
                    //         {
                    //             url: `https://discord.com/api/v10/guilds/${guild.id}/vanity-url`,
                    //             headers: {
                    //                 authorization: token,
                    //                 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
                    //             },
                    //             json: { code: code }
                    //         }
                    //     );

                    //     console.log(requestAudit.json())

                    // };

                    // await setVanityURL (guild, botsСonfig.SelfAntiNuke, oldGuild.vanityURLCode);

                };

                const accessOfMember = await getAccess ('editGuildLink', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };
            
        }
    
        else {

            let target = false;
            let name = 'Изменение сервераа';
            const audit = await getAudit (1, newGuild.id);
            const member = audit[0];
            
            if (member) {

                if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) return;
    
                async function cancel () {
    
                    newGuild.setName(oldGuild.name).catch(() => {});
                    newGuild.setIcon(oldGuild.icon).catch(() => {});
                    newGuild.setBanner(oldGuild.banner).catch(() => {});
                    newGuild.setSplash(oldGuild.splash).catch(() => {});
    
                };

                const accessOfMember = await getAccess ('editGuild', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        };

    });

    client.on('webhookUpdate', async (TextChannel) => {

        let name = 'Действие с Webhook';

        const audit50 = await getAudit (50, TextChannel.id, 'channelId');
        const audit51 = await getAudit (51, TextChannel.id, 'channelId');
        const audit52 = await getAudit (52, TextChannel.id, 'channelId');

        const audit = audit50 || audit51 || audit52;
        let target = `・**${audit[1].target.name}**\n・${TextChannel}`;
        const member = audit50[0];
        
        if (member) {
        
            if (!member.permissions.has(PermissionsBitField.Flags.ManageWebhooks)) return;

            async function cancel () {

                audit[1].target.delete().catch(() => {});

            };
            
            const accessOfMember = await getAccess ('editWebhook', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });


    client.on('emojiCreate', async (emoji) => {

        let name = 'Действие с эмоджи (Создание)';
        let target = `・**${emoji.name}**\n・${emoji.id}`;
        const audit = await getAudit (60, emoji.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

                emoji.delete().catch(() => {});

            };

            const accessOfMember = await getAccess ('editEmoji', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });

    client.on('emojiDelete', async (emoji) => {

        let name = 'Действие с эмоджи (Удаление)';
        let target = `・**${emoji.name}**\n・${emoji.id}`;
        const audit = await getAudit (62, emoji.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

            };

            const accessOfMember = await getAccess ('editEmoji', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });

    client.on('emojiUpdate', async (oldEmoji, newEmoji) => {

        let name = 'Действие с эмоджи (Изменение)';
        let target = `・**${newEmoji.name}**\n・${newEmoji.id}`;
        const audit = await getAudit (61, newEmoji.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

                newEmoji.setName(oldEmoji.name).catch(() => {});

            };

            const accessOfMember = await getAccess ('editEmoji', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });


    client.on('stickerCreate', async (sticker) => {

        let name = 'Действие со стикерами (Создание)';
        let target = `・**${sticker.name}**\n・${sticker.id}`;
        const audit = await getAudit (90, sticker.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

                sticker.delete().catch(() => {});

            };

            const accessOfMember = await getAccess ('editSticker', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });

    client.on('stickerDelete', async (sticker) => {

        let name = 'Действие со стикерами (Удаление)';
        let target = `・**${sticker.name}**\n・${sticker.id}`;
        const audit = await getAudit (92, sticker.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

            };

            const accessOfMember = await getAccess ('editSticker', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });

    client.on('stickerUpdate', async (oldSticker, newSticker) => {

        let name = 'Действие со стикерами (Изменение)';
        let target = `・**${newSticker.name}**\n・${newSticker.id}`;
        const audit = await getAudit (91, newSticker.id);
        const member = audit[0];
        
        if (member) {

            async function cancel () {

                newSticker.setName(oldSticker.name).catch(() => {});

            };

            const accessOfMember = await getAccess ('editSticker', member);
            switch (accessOfMember[0]) {

                case 0: break;

                case 1: {
                    
                    await cancel ();
                    break;

                }

                case 2: {
                    
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 3: {
                    
                    await cancel ();
                    await warning (member, accessOfMember, name, target);
                    break;

                }

                case 4: {
                    
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

                case 5: {
                    
                    await cancel ();
                    await quarantine (member, accessOfMember, name, target);
                    break;

                }

            };

        };

    });
      

    client.on('messageCreate', async (message) => {

        let rolesPing = 0;
        if (message.mentions.roles) message.mentions.roles.forEach(role => role.members.forEach(member => rolesPing++));

        if (message.mentions.everyone && message.webhookId || rolesPing >= 100 && message.webhookId) {

            message.delete().catch(() => {});
            const webhooks = await message.channel.fetchWebhooks();
            const webhookToDelete = webhooks.find(webhook => webhook.id === message.webhookId);
            if (webhookToDelete) await webhookToDelete.delete().catch(() => {});

        }

        else if (message.mentions.everyone || rolesPing >= 100) {

            let name = 'Упоминание @everyone/@here/ролей';
            let target = `${message.content}`;
            const member = message.member;
            
            if (member) {
    
                async function cancel () {

                    message.delete().catch(() => {});
    
                };
    
                const accessOfMember = await getAccess ('ping', member);
                switch (accessOfMember[0]) {
    
                    case 0: break;
    
                    case 1: {
                        
                        await cancel ();
                        break;
    
                    }
    
                    case 2: {
                        
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 3: {
                        
                        await cancel ();
                        await warning (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 4: {
                        
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                    case 5: {
                        
                        await cancel ();
                        await quarantine (member, accessOfMember, name, target);
                        break;
    
                    }
    
                };
    
            };

        };

    });

    setInterval(() => {

        for (let pickAction in access[guild.id].Actions) {
            
            if (access[guild.id].Actions[pickAction] && access[guild.id].Actions[pickAction].DateEnd <= Date.now()/1000) {
                
                users[access[guild.id].Actions[pickAction].Member].Warnings--;
                access[guild.id].Actions = access[guild.id].Actions.filter((n) => { return n != access[guild.id].Actions[pickAction] });

            };

        };
        
    }, 5000);

};