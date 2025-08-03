const guildСonfig = require('../../../../guild.json');  
const { makeid } = require('../Structure/numbersGenerator.js');
const { checkingForNumber, checkingForAvailability } = require('../Structure/checkingFor.js');
const { menuChannel, pageChange, menuUser, menuRole } = require('../Structure/buttonGenerator.js');
const { getAvatar, targetMessageEditComponents, getColorInfo } = require('../Structure/getAttribute.js');
const { PermissionsBitField, ChannelType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getCurrentDateTime, hourTranslatorBold, hourTranslatorMini, hourTranslator, convertSecondsToTime } = require('../Structure/timeManage.js');


module.exports = async (client, appearance, config, db, message) => {

    const { member, channel, guild, content } = message;
    const clientAvatar = await client.user.avatarURL({ dynamic: true, size: 512 });
    const { users, access } = db;    

    const messageArray = content.split(' ');
    const command = messageArray[0].replace(config.main.prefix, '');
    const args = messageArray.slice(1);
    const messageArrayFull = content.split(' '); 
    const argsF = messageArrayFull.slice(1);
        
    checkingForAvailability (db, member);
    const memberAvatar = await getAvatar(member);
    if (!guildСonfig.owners.includes(member.id)) return message.delete().catch(() => {});
    message.delete().catch(() => {});

    const actions = {}; 
    let parameters = {};
    

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

    let groupList = [];
    let groupsComponents = [];
    groupList.push(
        {
            name: `${access[access[guild.id].Default].name}`,
            value: `Лимит: **${access[access[guild.id].Default].warnings}**/${hourTranslatorBold (access[access[guild.id].Default].warningsTime)}`,
            inline: true
        }
    );

    groupsComponents.push( 
        {
            label: `${access[access[guild.id].Default].name}`, 
            value: `${access[guild.id].Default}`, 
            description: `${access[access[guild.id].Default].warnings} предупреждений в ${hourTranslator (access[access[guild.id].Default].warningsTime)}`,
            emoji: '*️⃣',
            default: false 
        }
    );

    for (let pickGroup in access[guild.id].Groups) {

        let pickGroupId = access[guild.id].Groups[pickGroup];
        
        groupList.push(
            {
                name: `${access[pickGroupId].name}`,
                value: `Лимит: **${access[pickGroupId].warnings}**/${hourTranslatorBold (access[pickGroupId].warningsTime)}\nДоступ: **${access[pickGroupId].members.length}**`,
                inline: true
            }
        );

        groupsComponents.push( 
            {
                label: `${access[pickGroupId].name}`, 
                value: `${pickGroupId}`, 
                description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                emoji: '#️⃣',
                default: false 
            }
        );

    };

    const msg = await channel.send({  
        embeds: [
            {
                title: `${client.user.username + ' setup'}`,
                color: appearance.embed.color,
                description: `Всего групп: **${groupList.length}**\nАдминистратор: ${member}`,
                thumbnail: { url: memberAvatar },
                fields: groupList
            }   
        ],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2, 
                        style: 1, 
                        customId: 'access', 
                        label: 'Настройка доступа'
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 3,
                        customId: 'edit', 
                        placeholder: 'Выберите необходимую группу для редактирования', 
                        minValues: 1, 
                        maxValues: 1, 
                        options: groupsComponents
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2, 
                        style: 3, 
                        customId: 'create', 
                        label: 'Создать группу'
                    },
                    {
                        type: 2, 
                        style: 4, 
                        customId: 'delete', 
                        label: 'Удалить группу'
                    },
                    {
                        type: 2, 
                        style: 2, 
                        customId: 'exit', 
                        label: 'Выйти'
                    }
                ]
            }
        ]
    }).catch(() => {});

    
    let lastInt = Date.now() / 1000;
    const cheackLastInt = setInterval(async () => {

        if (lastInt + 100 - Date.now() / 1000 < 0) {
          
            msg.components.forEach(component => {

                let Comp = component.components;

                for (c = 0; c < Comp.length; c++) {

                    if (Comp[c].data.style !== 5) Comp[c].data.disabled = true;

                };
                
            });

            await msg.edit({ components: msg.components }).catch(() => {});
            return clearInterval(cheackLastInt);

        };

    }, 2000); 


    client.on('interactionCreate', async i => {

        if (!i.isModalSubmit()) return;

        if (!i.member|| i.member.id !== member.id) return;
        if (i.message.id !== msg.id) return;

        lastInt = Date.now() / 1000;

        switch (i.customId) { 
            
            default: {

                if (actions[i.customId] && actions[i.customId].all == false) return await actions[i.customId].actions[0](i);

            }

        };

    });

    const collectors = await msg.createMessageComponentCollector();
    collectors.on('collect', async i => {

        if (!i.member|| i.member.id !== member.id) return;
        lastInt = Date.now() / 1000;
        parameters.ping = false;    
        
        switch (i.customId) { 

            case 'exit': { 

                i.message.delete().catch(() => {});
                break;

            }
            
            case 'back': { 

                groupList = [];
                groupsComponents = [];
                groupList.push(
                    {
                        name: `${access[access[guild.id].Default].name}`,
                        value: `Лимит: **${access[access[guild.id].Default].warnings}**/${hourTranslatorBold (access[access[guild.id].Default].warningsTime)}`,
                        inline: true
                    }
                );
            
                groupsComponents.push( 
                    {
                        label: `${access[access[guild.id].Default].name}`, 
                        value: `${access[guild.id].Default}`, 
                        description: `${access[access[guild.id].Default].warnings} предупреждений в ${hourTranslator (access[access[guild.id].Default].warningsTime)}`,
                        emoji: '*️⃣',
                        default: false 
                    }
                );
            
                for (let pickGroup in access[guild.id].Groups) {
            
                    let pickGroupId = access[guild.id].Groups[pickGroup];
                    
                    groupList.push(
                        {
                            name: `${access[pickGroupId].name}`,
                            value: `Лимит: **${access[pickGroupId].warnings}**/${hourTranslatorBold (access[pickGroupId].warningsTime)}\nДоступ: **${access[pickGroupId].members.length}**`,
                            inline: true
                        }
                    );
            
                    groupsComponents.push( 
                        {
                            label: `${access[pickGroupId].name}`, 
                            value: `${pickGroupId}`, 
                            description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                            emoji: '#️⃣',
                            default: false 
                        }
                    );
            
                };

                i.update({  
                    content: ' ',
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Всего групп: **${groupList.length}**\nАдминистратор: ${member}`,
                            thumbnail: { url: memberAvatar },
                            fields: groupList
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 1, 
                                    customId: 'access', 
                                    label: 'Настройка доступа'
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'edit', 
                                    placeholder: 'Выберите необходимую группу для редактирования', 
                                    minValues: 1, 
                                    maxValues: 1, 
                                    options: groupsComponents
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 3, 
                                    customId: 'create', 
                                    label: 'Создать группу'
                                },
                                {
                                    type: 2, 
                                    style: 4, 
                                    customId: 'delete', 
                                    label: 'Удалить группу'
                                },
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'exit', 
                                    label: 'Выйти'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                break;

            }
            
            case 'access': { 

                i.update({
                    content: 'Загрузка...',
                    embeds: [

                    ],
                    components: [
                        
                    ]

                }).catch(() => {});

                groupList = [];
                for (let pickGroup in access[guild.id].Groups) {
            
                    let text = '';
                    let pickGroupFetch = access[access[guild.id].Groups[pickGroup]];
                    for (let pickMember in pickGroupFetch.members) {

                        const pickMemberFetch = await guild.members.fetch(pickGroupFetch.members[pickMember]).catch(() => {}) || await guild.roles.fetch(pickGroupFetch.members[pickMember]).catch(() => {}) || false;
                        if (text == '' && pickMemberFetch) text += `${pickMemberFetch}`;
                        else if (pickMemberFetch) text += `\n${pickMemberFetch}`;

                    };
                    
                    groupList.push(
                        {
                            name: `${pickGroupFetch.name}`,
                            value: `${text || 'Отсутствует'}`,
                            inline: true
                        }
                    );
            
                };

                setTimeout(() => {

                    i.editReply({  
                        content: ' ',
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `Всего групп: **${groupList.length}**\nАдминистратор: ${member}`,
                                thumbnail: { url: memberAvatar },
                                fields: groupList
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'accessUR', 
                                        label: 'Изменение доступа'
                                    },
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'back', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                }, 1000);

                break;

            }

            case 'accessUR': { 

                groupsComponents = [];
                parameters.ping = true;

                i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `**Пинганите** или напишите **айди** роли/пользователя\nАдминистратор: ${member}`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                const filter = i => i.member.id === member.id;
                const messageOfMember = await channel.awaitMessages ({ filter, max: 1, time: 30000 });
                if (!messageOfMember.first() && parameters.ping) 
                return i.editReply({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Время на ответ **вышло**`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                if (messageOfMember.first()) {

                    let memberTF = false;
                    let pingOfActions = false;
                    const messageOfMemberFetch = messageOfMember.first();
                    messageOfMemberFetch.delete().catch(() => {});

                    if (!messageOfMemberFetch.mentions.roles.first() && !messageOfMemberFetch.mentions.users.first()) {

                        pingOfActions = await guild.members.fetch(messageOfMemberFetch.content).catch(() => {});
                        if (pingOfActions) memberTF = true;
                        if (!pingOfActions) pingOfActions = await guild.roles.fetch(messageOfMemberFetch.content).catch(() => {});
                        if (!pingOfActions) pingOfActions = false;

                    }
                    
                    else if (messageOfMemberFetch.mentions.roles.first() && await guild.roles.fetch(messageOfMemberFetch.mentions.roles.first().id).catch(() => {})) pingOfActions = await guild.roles.fetch(messageOfMemberFetch.mentions.roles.first().id).catch(() => {});
                    else if (messageOfMemberFetch.mentions.users.first() && await guild.members.fetch(messageOfMemberFetch.mentions.users.first().id).catch(() => {})) pingOfActions = await guild.members.fetch(messageOfMemberFetch.mentions.users.first().id).catch(() => {}), memberTF = true;
                    else pingOfActions = false;

                    if (!pingOfActions) 
                    return i.editReply({  
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `Пользователь/роль **не был**(**а**) найден(а)`,
                                thumbnail: { url: memberAvatar }
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'access', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                    checkingForAvailability (db, pingOfActions);

                    let components = [];
                    components.push( 
                        {
                            label: `Очистить группы`, 
                            value: `clear`, 
                            description: `Удалить все группы пользователя`,
                            emoji: '🗑️'
                        }
                    );

                    for (let pickGroup in access[guild.id].Groups) {
    
                        let pickGroupId = access[guild.id].Groups[pickGroup];
                        components.push( 
                            {
                                label: `${access[pickGroupId].name}`, 
                                value: `${pickGroupId}`, 
                                description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                                emoji: '#️⃣',
                                default: access[pickGroupId].members.includes(pingOfActions.id) 
                            }
                        );
    
                    };

                    parameters.pingOfActions = pingOfActions;

                    i.editReply({  
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                                thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'accessGroupSelect', 
                                        placeholder: 'Выберите необходимые группы', 
                                        minValues: 1, 
                                        maxValues: components.length, 
                                        options: components
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'accessOf', 
                                        label: 'Доступ'
                                    },
                                    {
                                        type: 2, 
                                        style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                        customId: 'quarantine', 
                                        label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                        disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                    },
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'access', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                    const accessGroupSelect = (async (newI) => {
    
                        components = [];
                        users[pingOfActions.id].Groups = [];
                        for (let pickGroup in access[guild.id].Groups) access[access[guild.id].Groups[pickGroup]].members = access[access[guild.id].Groups[pickGroup]].members.filter((n) => { return n != pingOfActions.id });
                        if (!newI.values.includes('clear')) for (let pickPermition in newI.values) access[newI.values[pickPermition]].members.push(pingOfActions.id);
                        if (!newI.values.includes('clear')) users[pingOfActions.id].Groups = newI.values;
    
                        components.push( 
                            {
                                label: `Очистить группы`, 
                                value: `clear`, 
                                description: `Удалить все группы пользователя`,
                                emoji: '🗑️'
                            }
                        );
    
                        for (let pickGroup in access[guild.id].Groups) {
        
                            let pickGroupId = access[guild.id].Groups[pickGroup];
                            components.push( 
                                {
                                    label: `${access[pickGroupId].name}`, 
                                    value: `${pickGroupId}`, 
                                    description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                                    emoji: '#️⃣',
                                    default: access[pickGroupId].members.includes(pingOfActions.id) 
                                }
                            );
        
                        };

                        newI.update({  
                            embeds: [
                                {
                                    title: `${client.user.username + ' setup'}`,
                                    color: appearance.embed.color,
                                    description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                                    thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                                }   
                            ],
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 3,
                                            customId: 'accessGroupSelect', 
                                            placeholder: 'Выберите необходимые группы', 
                                            minValues: 1, 
                                            maxValues: components.length, 
                                            options: components
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 1, 
                                            customId: 'accessOf', 
                                            label: 'Доступ'
                                        },
                                        {
                                            type: 2, 
                                            style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                            customId: 'quarantine', 
                                            label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                            disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                        },
                                        {
                                            type: 2, 
                                            style: 2, 
                                            customId: 'access', 
                                            label: 'Назад'
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => {});
    
                    });
    
                    actions['accessGroupSelect'] = {
                        actions: [accessGroupSelect],
                        all: false
                    };

                };


                break;

            }

            case 'backAccessUR': {

                let memberTF = false;
                let pingOfActions = false;
                let pingOfActionsOld = parameters.pingOfActions;
                
                pingOfActions = await guild.roles.fetch(pingOfActionsOld.id).catch(() => {});
                if (!pingOfActions) pingOfActions = await guild.members.fetch(pingOfActionsOld.id).catch(() => {}), memberTF = true;

                if (!pingOfActions) 
                return i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Пользователь/роль **не был**(**а**) найден(а)`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                checkingForAvailability (db, pingOfActions);

                let components = [];
                components.push( 
                    {
                        label: `Очистить группы`, 
                        value: `clear`, 
                        description: `Удалить все группы пользователя`,
                        emoji: '🗑️'
                    }
                );

                for (let pickGroup in access[guild.id].Groups) {

                    let pickGroupId = access[guild.id].Groups[pickGroup];
                    components.push( 
                        {
                            label: `${access[pickGroupId].name}`, 
                            value: `${pickGroupId}`, 
                            description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                            emoji: '#️⃣',
                            default: access[pickGroupId].members.includes(pingOfActions.id) 
                        }
                    );

                };


                i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                            thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'accessGroupSelect', 
                                    placeholder: 'Выберите необходимые группы', 
                                    minValues: 1, 
                                    maxValues: components.length, 
                                    options: components
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 1, 
                                    customId: 'accessOf', 
                                    label: 'Доступ'
                                },
                                {
                                    type: 2, 
                                    style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                    customId: 'quarantine', 
                                    label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                    disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                },
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                const accessGroupSelect = (async (newI) => {

                    components = [];
                    users[pingOfActions.id].Groups = [];
                    for (let pickGroup in access[guild.id].Groups) access[access[guild.id].Groups[pickGroup]].members = access[access[guild.id].Groups[pickGroup]].members.filter((n) => { return n != pingOfActions.id });
                    if (!newI.values.includes('clear')) for (let pickPermition in newI.values) access[newI.values[pickPermition]].members.push(pingOfActions.id);
                    if (!newI.values.includes('clear')) users[pingOfActions.id].Groups = newI.values;

                    components.push( 
                        {
                            label: `Очистить группы`, 
                            value: `clear`, 
                            description: `Удалить все группы пользователя`,
                            emoji: '🗑️'
                        }
                    );

                    for (let pickGroup in access[guild.id].Groups) {
    
                        let pickGroupId = access[guild.id].Groups[pickGroup];
                        components.push( 
                            {
                                label: `${access[pickGroupId].name}`, 
                                value: `${pickGroupId}`, 
                                description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                                emoji: '#️⃣',
                                default: access[pickGroupId].members.includes(pingOfActions.id) 
                            }
                        );
    
                    };

                    newI.update({  
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                                thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'accessGroupSelect', 
                                        placeholder: 'Выберите необходимые группы', 
                                        minValues: 1, 
                                        maxValues: components.length, 
                                        options: components
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'accessOf', 
                                        label: 'Доступ'
                                    },
                                    {
                                        type: 2, 
                                        style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                        customId: 'quarantine', 
                                        label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                        disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                    },
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'access', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['accessGroupSelect'] = {
                    actions: [accessGroupSelect],
                    all: false
                };

                break;

            }
            
            case 'quarantine': {

                let memberTF = false;
                let pingOfActions = false;
                let pingOfActionsOld = parameters.pingOfActions;
                
                pingOfActions = await guild.roles.fetch(pingOfActionsOld.id).catch(() => {});
                if (!pingOfActions) pingOfActions = await guild.members.fetch(pingOfActionsOld.id).catch(() => {}), memberTF = true;

                if (!pingOfActions) 
                return i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Пользователь/роль **не был**(**а**) найден(а)`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                checkingForAvailability (db, pingOfActions);

                if (users[pingOfActions.id].Quarantine) {

                    if (users[pingOfActions.id].Roles !== false) member.roles.set(users[pingOfActions.id].Roles).catch(() => {});
                    users[pingOfActions.id].Roles = false;

                };

                users[pingOfActions.id].Quarantine = false;

                let components = [];
                components.push( 
                    {
                        label: `Очистить группы`, 
                        value: `clear`, 
                        description: `Удалить все группы пользователя`,
                        emoji: '🗑️'
                    }
                );

                for (let pickGroup in access[guild.id].Groups) {

                    let pickGroupId = access[guild.id].Groups[pickGroup];
                    components.push( 
                        {
                            label: `${access[pickGroupId].name}`, 
                            value: `${pickGroupId}`, 
                            description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                            emoji: '#️⃣',
                            default: access[pickGroupId].members.includes(pingOfActions.id) 
                        }
                    );

                };


                i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                            thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'accessGroupSelect', 
                                    placeholder: 'Выберите необходимые группы', 
                                    minValues: 1, 
                                    maxValues: components.length, 
                                    options: components
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 1, 
                                    customId: 'accessOf', 
                                    label: 'Доступ'
                                },
                                {
                                    type: 2, 
                                    style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                    customId: 'quarantine', 
                                    label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                    disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                },
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'access', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                const accessGroupSelect = (async (newI) => {

                    components = [];
                    users[pingOfActions.id].Groups = [];
                    for (let pickGroup in access[guild.id].Groups) access[access[guild.id].Groups[pickGroup]].members = access[access[guild.id].Groups[pickGroup]].members.filter((n) => { return n != pingOfActions.id });
                    if (!newI.values.includes('clear')) for (let pickPermition in newI.values) access[newI.values[pickPermition]].members.push(pingOfActions.id);
                    if (!newI.values.includes('clear')) users[pingOfActions.id].Groups = newI.values;

                    components.push( 
                        {
                            label: `Очистить группы`, 
                            value: `clear`, 
                            description: `Удалить все группы пользователя`,
                            emoji: '🗑️'
                        }
                    );

                    for (let pickGroup in access[guild.id].Groups) {
    
                        let pickGroupId = access[guild.id].Groups[pickGroup];
                        components.push( 
                            {
                                label: `${access[pickGroupId].name}`, 
                                value: `${pickGroupId}`, 
                                description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                                emoji: '#️⃣',
                                default: access[pickGroupId].members.includes(pingOfActions.id) 
                            }
                        );
    
                    };

                    newI.update({  
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `${memberTF ? 'Пользователь' : 'Роль'}: ${pingOfActions} \`${pingOfActions.id}\`\n${memberTF ? `Карантин: ${users[pingOfActions.id].Quarantine ? `${`<t:${Math.floor(users[pingOfActions.id].Quarantine.Date)}:d>`} \`${users[pingOfActions.id].Quarantine.Reason}\`` : 'Отсутствует'}` : ''}`,
                                thumbnail: { url: await getAvatar (memberTF ? pingOfActions : member) }
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'accessGroupSelect', 
                                        placeholder: 'Выберите необходимые группы', 
                                        minValues: 1, 
                                        maxValues: components.length, 
                                        options: components
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'accessOf', 
                                        label: 'Доступ'
                                    },
                                    {
                                        type: 2, 
                                        style: memberTF && users[pingOfActions.id].Quarantine ? 4 : 2, 
                                        customId: 'quarantine', 
                                        label: `Карантин: ${memberTF && users[pingOfActions.id].Quarantine ? 'Есть' : 'Нет'}`,
                                        disabled: !memberTF || !users[pingOfActions.id].Quarantine
                                    },
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'access', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['accessGroupSelect'] = {
                    actions: [accessGroupSelect],
                    all: false
                };

                break;

            }

            case 'accessOf': { 

                groupList = [];
                let permisionsOther = {};
                let pingOfActions = parameters.pingOfActions;
                let permisions = access[access[guild.id].Default].permitions;
                for (let pickPermission in permisions) if (!permisionsOther[pickPermission]) permisionsOther[pickPermission] = {action: permisions[pickPermission].action};        
                
                for (const pickGroup in users[pingOfActions.id].Groups) {
        
                    let fetchPickGroup = access[users[pingOfActions.id].Groups[pickGroup]];
                    for (let pickPermission in fetchPickGroup.permitions) if (!permisionsOther[pickPermission]) permisionsOther[pickPermission] = {action: permisions[pickPermission].action};
                    for (let pickPermission in fetchPickGroup.permitions) if (fetchPickGroup.permitions[pickPermission].action < permisionsOther[pickPermission].action) permisionsOther[pickPermission].action = fetchPickGroup.permitions[pickPermission].action;
        
                };
                
                for (pickRole in pingOfActions._roles) {
            
                    if (!users[pingOfActions._roles[pickRole]]) {
        
                        const pickRoleFetch = await guild.roles.fetch(pingOfActions._roles[pickRole]).catch(() => {});
                        checkingForAvailability (db, pickRoleFetch);
        
                    };
        
                    for (const pickGroup in users[pingOfActions._roles[pickRole]].Groups) {
        
                        let fetchPickGroup = access[users[pingOfActions._roles[pickRole]].Groups[pickGroup]];
                        for (let pickPermission in fetchPickGroup.permitions) if (!permisionsOther[pickPermission]) permisionsOther[pickPermission] = {action: permisions[pickPermission].action};
                        for (let pickPermission in fetchPickGroup.permitions) if (fetchPickGroup.permitions[pickPermission].action < permisionsOther[pickPermission].action) permisionsOther[pickPermission].action = fetchPickGroup.permitions[pickPermission].action;
            
                    };
        
                };
        
                let values = [];
                let bestMatch = access[access[guild.id].Default];
                let bestRatio = access[access[guild.id].Default].warnings / access[access[guild.id].Default].warningsTime;
        
                for (const pickGroup in users[pingOfActions.id].Groups) values.push(access[users[pingOfActions.id].Groups[pickGroup]]);
                for (pickRole in pingOfActions._roles) for (const pickGroup in users[pingOfActions._roles[pickRole]].Groups) values.push(access[users[pingOfActions._roles[pickRole]].Groups[pickGroup]]);
                
                values.forEach(obj => {
        
                    const ratio = obj.warnings / obj.warningsTime;
        
                    if (ratio > bestRatio) {
        
                        bestRatio = ratio;
                        bestMatch = obj;
        
                    };
            
                });

                let fields = [];

                for (let pickPermitions in permisionsOther) {
            
                    let pickPermitionFetch = permisionsOther[pickPermitions];
                    
                    fields.push(
                        {
                            name: `${permisions[pickPermitions].name}`,
                            value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            inline: true
                        }
                    );
            
                };
                

                i.update({  
                    content: ' ',
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Всего групп ${pingOfActions}: **${users[member.id].Groups.length}**\nЛимит пользователя: **${bestMatch.warnings}**/${hourTranslatorBold (bestMatch.warningsTime)}`,
                            thumbnail: { url: await getAvatar(member) },
                            fields: fields
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'backAccessUR', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                break;

            }

            case 'create': { 
                
                const modal = new ModalBuilder().setCustomId('create').setTitle(client.user.username + ' setup');
                const favoriteColorInput = new TextInputBuilder().setCustomId('Name').setLabel('Введите название').setPlaceholder(`Любые символы`).setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(30);
                const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
                const favoriteColorInput2 = new TextInputBuilder().setCustomId('Warnings').setLabel('Максимальное кол-во предупреждений').setValue(`${access[access[guild.id].Default].warnings}`).setPlaceholder(`Только числа`).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(5);
                const firstActionRow2 = new ActionRowBuilder().addComponents(favoriteColorInput2);
                const favoriteColorInput3 = new TextInputBuilder().setCustomId('WarningsTime').setLabel('Введите длительность').setValue(`${convertSecondsToTime (access[access[guild.id].Default].warningsTime)}`).setPlaceholder(`Формат: 1-99s|m|h|d|w`).setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(7);
                const firstActionRow3 = new ActionRowBuilder().addComponents(favoriteColorInput3);
                modal.addComponents(firstActionRow, firstActionRow2, firstActionRow3);
                await i.showModal(modal).catch(() => {});

                const create = (async (newI) => {
    
                    const Name = newI.fields.components[0].components[0].value;
                    const Warnings = Number (newI.fields.components[1].components[0].value);
                    const WarningsTime = newI.fields.components[2].components[0].value;

                    const match = WarningsTime.match(/^\d{1,99}(s|m|h|d|w)$/);

                    if(access[guild.id].Groups.length == 24) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,  
                                description: `Максимальное кол-во групп **достигнуто**`,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    if(match == null) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,  
                                description: `Доступен **только** формат \`1-99s|m|h|d|w\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    const WarningsTimeFetch = (+match[0].slice(0,-1))*(match[1]=='s'?1:match[1]=='m'?60:match[1]=='h'?60*60:match[1]=='d'?60*60*24:match[1]=='w'?60*60*24*7:0);

                    if (WarningsTimeFetch < 10) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Минимальное **установленное** время \`10s\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    if (!checkingForNumber (Warnings)) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Доступны **только** числа \`${Warnings}\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});
    
                    newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Создаю группу **${Name}**`,
                                thumbnail: { url: memberAvatar } 
                            }
                        ], 
                        components: [

                        ]
                    }).catch(() => {});

                    let idGroup = makeid (20);
                    access[idGroup] = {
            
                        name: Name,
                        everyone: false,
                        canDelete: true,
            
                        warningsTime: WarningsTimeFetch,
                        warnings: Warnings,
            
                        members: [],
            
                        permitions: {}
            
                    };

                    access[guild.id].Groups.push(idGroup);
                    let timelyPermitions = access[access[guild.id].Default].permitions;
                    for (let pickPermitions in timelyPermitions) access[idGroup].permitions[pickPermitions] = {name: timelyPermitions[pickPermitions].name, event: timelyPermitions[pickPermitions].event, action: timelyPermitions[pickPermitions].action} ;

                    setTimeout(() => {

                        let fields = [];
                        let options = [];
                        parameters.group = idGroup;
                        for (let pickPermitions in access[idGroup].permitions) {
                    
                            let pickPermitionFetch = access[idGroup].permitions[pickPermitions];
                            
                            fields.push(
                                {
                                    name: `${pickPermitionFetch.name}`,
                                    value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                    inline: true
                                }
                            );
                                
                            options.push( 
                                {
                                    label: `${pickPermitionFetch.name}`, 
                                    value: `${pickPermitions}`, 
                                    description: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                    default: false 
                                }
                            );
                    
                        };
                        
                        
                        newI.editReply({
                            embeds: [
                                {
                                    title: `${client.user.username + " setup"}`,
                                    color: appearance.embed.color,
                                    description: `Группа: **${Name}** **${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)}\nДоступ: **${access[idGroup].members.length}**`,
                                    thumbnail: { url: memberAvatar },
                                    fields: fields
                                }
                            ], 
                            components: [
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 2, 
                                            customId: 'rename', 
                                            label: 'Переименовать'
                                        },
                                        {
                                            type: 2, 
                                            style: 1, 
                                            customId: 'editLimit', 
                                            label: 'Изменить лимит действий'
                                        },
                                        {
                                            type: 2, 
                                            style: 3, 
                                            customId: 'groupAccess', 
                                            label: 'Список доступа'
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 3,
                                            customId: 'editGroupPermition', 
                                            placeholder: 'Выберите действие для редактирования', 
                                            minValues: 1, 
                                            maxValues: options.length, 
                                            options: options
                                        }
                                    ]
                                },
                                {
                                    type: 1,
                                    components: [
                                        {
                                            type: 2, 
                                            style: 2, 
                                            customId: 'back', 
                                            label: 'Назад'
                                        }
                                    ]
                                }
                            ]
                        }).catch(() => {});
                        
                    }, 2000);

                });

                actions['create'] = {
                    actions: [create],
                    all: false
                };

                break;

            }

            case 'delete': { 

                groupsComponents = [];

                for (let pickGroup in access[guild.id].Groups) {

                    let pickGroupId = access[guild.id].Groups[pickGroup];
                    groupsComponents.push( 
                        {
                            label: `${access[pickGroupId].name}`, 
                            value: `${pickGroupId}`, 
                            description: `${access[pickGroupId].warnings} предупреждений в ${hourTranslator (access[pickGroupId].warningsTime)}`,
                            emoji: '#️⃣',
                            default: false 
                        }
                    );

                };

                if (groupsComponents.length == 0)
                return i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' error'}`,
                            color: appearance.embed.errorColor,
                            description: `${member}, в ${client.user} **${groupsComponents.length}** групп`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'back', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                i.update({  
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `${member}, выберите необходимую **группу**\nВсего групп: **${groupsComponents.length}**`,
                            thumbnail: { url: memberAvatar }
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'deleteSelect', 
                                    placeholder: 'Выберите необходимую группу для удаления', 
                                    minValues: 1, 
                                    maxValues: 1, 
                                    options: groupsComponents
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'back', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                const deleteSelect = (async (newI) => {
                    
                    access[guild.id].Groups = access[guild.id].Groups.filter((n) => { return n != newI.values[0] });
                    for (let pickMember in access[newI.values[0]].members) {

                        const pickMemberFetch = access[newI.values[0]].members[pickMember];
                        users[pickMemberFetch].Groups = users[pickMemberFetch].Groups.filter((n) => { return n != newI.values[0] });
                        
                    };

                    newI.update({  
                        embeds: [
                            {
                                title: `${client.user.username + ' setup'}`,
                                color: appearance.embed.color,
                                description: `${member}, Вы **успешно** удалили группу **${access[newI.values[0]].name}**`,
                                thumbnail: { url: memberAvatar }
                            }   
                        ],
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'back', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['deleteSelect'] = {
                    actions: [deleteSelect],
                    all: false
                };

                break;

            }

            case 'edit': { 

                let fields = [];
                let options = [];

                parameters.group = i.values[0];


                for (let pickPermitions in access[i.values[0]].permitions) {
            
                    let pickPermitionFetch = access[i.values[0]].permitions[pickPermitions];
                    
                    fields.push(
                        {
                            name: `${pickPermitionFetch.name}`,
                            value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            inline: true
                        }
                    );
                        
                    options.push( 
                        {
                            label: `${pickPermitionFetch.name}`, 
                            value: `${pickPermitions}`, 
                            description: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            default: false 
                        }
                    );
            
                };
                
                
                i.update({
                    embeds: [
                        {
                            title: `${client.user.username + " setup"}`,
                            color: appearance.embed.color,
                            description: `Группа: **${access[i.values[0]].name}** **${access[i.values[0]].warnings}**/${hourTranslatorBold (access[i.values[0]].warningsTime)}\n${!access[i.values[0]].everyone ? `Доступ: **${access[i.values[0]].members.length}**\n` : ''}${access[i.values[0]].everyone ? `Относиться к @everyone\n` : ''}`,
                            thumbnail: { url: memberAvatar },
                            fields: fields
                        }
                    ], 
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'rename', 
                                    label: 'Переименовать'
                                },
                                {
                                    type: 2, 
                                    style: 1, 
                                    customId: 'editLimit', 
                                    label: 'Изменить лимит действий'
                                },
                                {
                                    type: 2, 
                                    style: 3, 
                                    customId: 'groupAccess', 
                                    label: 'Список доступа'
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'editGroupPermition', 
                                    placeholder: 'Выберите действие для редактирования', 
                                    minValues: 1, 
                                    maxValues: options.length, 
                                    options: options
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'back', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                break;

            }

            case 'backGroup': { 

                let fields = [];
                let options = [];

                let idGroup = parameters.group;

                for (let pickPermitions in access[idGroup].permitions) {
            
                    let pickPermitionFetch = access[idGroup].permitions[pickPermitions];
                    
                    fields.push(
                        {
                            name: `${pickPermitionFetch.name}`,
                            value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            inline: true
                        }
                    );
                        
                    options.push( 
                        {
                            label: `${pickPermitionFetch.name}`, 
                            value: `${pickPermitions}`, 
                            description: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            default: false 
                        }
                    );
            
                };
                
                
                i.update({
                    embeds: [
                        {
                            title: `${client.user.username + " setup"}`,
                            color: appearance.embed.color,
                            description: `Группа: **${access[idGroup].name}** **${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)}\n${!access[idGroup].everyone ? `Доступ: **${access[idGroup].members.length}**\n` : ''}${access[idGroup].everyone ? `Относиться к @everyone\n` : ''}`,
                            thumbnail: { url: memberAvatar },
                            fields: fields
                        }
                    ], 
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'rename', 
                                    label: 'Переименовать'
                                },
                                {
                                    type: 2, 
                                    style: 1, 
                                    customId: 'editLimit', 
                                    label: 'Изменить лимит действий'
                                },
                                {
                                    type: 2, 
                                    style: 3, 
                                    customId: 'groupAccess', 
                                    label: 'Список доступа'
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'editGroupPermition', 
                                    placeholder: 'Выберите действие для редактирования', 
                                    minValues: 1, 
                                    maxValues: options.length, 
                                    options: options
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'back', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                break;

            }

            case 'rename': { 
                
                let idGroup = parameters.group;

                const modal = new ModalBuilder().setCustomId('rename').setTitle(client.user.username + ' setup');
                const favoriteColorInput = new TextInputBuilder().setCustomId('Name').setLabel('Введите новое название').setPlaceholder(`Любые символы`).setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(30);
                const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
                modal.addComponents(firstActionRow);
                await i.showModal(modal).catch(() => {});

                const rename = (async (newI) => {
    
                    const Name = newI.fields.components[0].components[0].value;
                    access[parameters.group].name = Name;

                    let fields = [];
                    let options = [];

                    for (let pickPermitions in access[idGroup].permitions) {
                
                        let pickPermitionFetch = access[idGroup].permitions[pickPermitions];
                        
                        fields.push(
                            {
                                name: `${pickPermitionFetch.name}`,
                                value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                inline: true
                            }
                        );
                            
                        options.push( 
                            {
                                label: `${pickPermitionFetch.name}`, 
                                value: `${pickPermitions}`, 
                                description: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                default: false 
                            }
                        );
                
                    };
                    
                    
                    newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Группа: **${access[idGroup].name}** **${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)}\nДоступ: **${access[idGroup].members.length}**`,
                                thumbnail: { url: memberAvatar },
                                fields: fields
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'rename', 
                                        label: 'Переименовать'
                                    },
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'editLimit', 
                                        label: 'Изменить лимит действий'
                                    },
                                    {
                                        type: 2, 
                                        style: 3, 
                                        customId: 'groupAccess', 
                                        label: 'Список доступа'
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'editGroupPermition', 
                                        placeholder: 'Выберите действие для редактирования', 
                                        minValues: 1, 
                                        maxValues: 1, 
                                        options: options
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'back', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['rename'] = {
                    actions: [rename],
                    all: false
                };

                break;

            }

            case 'editLimit': { 
                
                let idGroup = parameters.group;

                const modal = new ModalBuilder().setCustomId('editLimit').setTitle(client.user.username + ' setup');
                const favoriteColorInput2 = new TextInputBuilder().setCustomId('Warnings').setLabel('Максимальное кол-во предупреждений').setValue(`${access[idGroup].warnings}`).setPlaceholder(`Только числа`).setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(5);
                const firstActionRow2 = new ActionRowBuilder().addComponents(favoriteColorInput2);
                const favoriteColorInput3 = new TextInputBuilder().setCustomId('WarningsTime').setLabel('Введите длительность').setValue(`${convertSecondsToTime (access[idGroup].warningsTime)}`).setPlaceholder(`Формат: 1-99s|m|h|d|w`).setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(7);
                const firstActionRow3 = new ActionRowBuilder().addComponents(favoriteColorInput3);
                modal.addComponents(firstActionRow2, firstActionRow3);
                await i.showModal(modal).catch(() => {});

                const editLimit = (async (newI) => {
    
                    const Warnings = Number (newI.fields.components[0].components[0].value);
                    const WarningsTime = newI.fields.components[1].components[0].value;

                    const match = WarningsTime.match(/^\d{1,99}(s|m|h|d|w)$/);

                    if(match == null) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,  
                                description: `Доступен **только** формат \`1-99s|m|h|d|w\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    const WarningsTimeFetch = (+match[0].slice(0,-1))*(match[1]=='s'?1:match[1]=='m'?60:match[1]=='h'?60*60:match[1]=='d'?60*60*24:match[1]=='w'?60*60*24*7:0);

                    if (WarningsTimeFetch < 10) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Минимальное **установленное** время \`10s\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    if (!checkingForNumber (Warnings)) 
                    return newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Доступны **только** числа \`${Warnings}\``,
                                thumbnail: { url: memberAvatar }
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        label: 'Назад', 
                                        customId: 'back', 
                                        style: 2
                                    }
                                ]
                            }
                        ] 
                    }).catch(() => {});

                    access[idGroup].warnings = Warnings;
                    access[idGroup].warningsTime = WarningsTimeFetch;


                    let fields = [];
                    let options = [];
                    parameters.group = idGroup;
                    for (let pickPermitions in access[idGroup].permitions) {
                
                        let pickPermitionFetch = access[idGroup].permitions[pickPermitions];
                        
                        fields.push(
                            {
                                name: `${pickPermitionFetch.name}`,
                                value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                inline: true
                            }
                        );
                            
                        options.push( 
                            {
                                label: `${pickPermitionFetch.name}`, 
                                value: `${pickPermitions}`, 
                                description: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                default: false 
                            }
                        );
                
                    };
                    
                    
                    newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `Группа: **${access[idGroup].name}** **${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)}\nДоступ: **${access[idGroup].members.length}**`,
                                thumbnail: { url: memberAvatar },
                                fields: fields
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'rename', 
                                        label: 'Переименовать'
                                    },
                                    {
                                        type: 2, 
                                        style: 1, 
                                        customId: 'editLimit', 
                                        label: 'Изменить лимит действий'
                                    },
                                    {
                                        type: 2, 
                                        style: 3, 
                                        customId: 'groupAccess', 
                                        label: 'Список доступа'
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'editGroupPermition', 
                                        placeholder: 'Выберите действие для редактирования', 
                                        minValues: 1, 
                                        maxValues: options.length, 
                                        options: options
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'back', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['editLimit'] = {
                    actions: [editLimit],
                    all: false
                };

                break;

            }
            
            case 'groupAccess': { 

                let text = '';
                groupList = [];
                let idGroup = parameters.group;
                let pickGroupFetch = access[idGroup];
                for (let pickMember in pickGroupFetch.members) {

                    const pickMemberFetch = await guild.members.fetch(pickGroupFetch.members[pickMember]).catch(() => {}) || await guild.roles.fetch(pickGroupFetch.members[pickMember]).catch(() => {}) || false;
                    if (text == '' && pickMemberFetch) text += `${pickMemberFetch}`;
                    else if (pickMemberFetch) text += `\n${pickMemberFetch}`;

                };
                
                groupList.push(
                    {
                        name: `${pickGroupFetch.name} (${pickGroupFetch.members.length})`,
                        value: `${text || 'Отсутствует'}`,
                        inline: true
                    }
                );
            
                

                i.update({  
                    content: ' ',
                    embeds: [
                        {
                            title: `${client.user.username + ' setup'}`,
                            color: appearance.embed.color,
                            description: `Всего групп: **${pickGroupFetch.name}**\nЛимит: **${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)}`,
                            thumbnail: { url: memberAvatar },
                            fields: groupList
                        }   
                    ],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'backGroup', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                break;

            }

            case 'editGroupPermition': {

                idGroup = parameters.group;
                parameters.pickGroups = i.values;

                let fields = [];

                for (let pickPermition in parameters.pickGroups) {
                    
                    let pickPermitionFetch = access[idGroup].permitions[parameters.pickGroups[pickPermition]];
                    
                    fields.push(
                        {
                            name: `${pickPermitionFetch.name}`,
                            value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                            inline: true
                        }
                    );
            
                };
                
        
                i.update({
                    embeds: [
                        {
                            title: `${client.user.username + " setup"}`,
                            color: appearance.embed.color,
                            description: `${member}, выберите **необходимые** права для групп(ы)\nГруппа: **${access[idGroup].name}** (**${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)})`,
                            thumbnail: { url: memberAvatar },
                            fields: fields
                        }
                    ], 
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    customId: 'editPermitionsAction', 
                                    placeholder: `Выберите необходимое противодейсвие для групп(ы) — ${fields.length}`, 
                                    minValues: 1, 
                                    maxValues: 1, 
                                    options: [
                                        {
                                            label: `Игнорировать`, 
                                            value: '0'
                                        },
                                        {
                                            label: `Отмена`, 
                                            value: '1'
                                        },
                                        {
                                            label: `Предупреждение`, 
                                            value: '2'
                                        },
                                        {
                                            label: `Предупреждение + Отмена`, 
                                            value: '3'
                                        },
                                        {
                                            label: `Карантин`, 
                                            value: '4'
                                        },
                                        {
                                            label: `Карантин + Отмена`, 
                                            value: '5'
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, 
                                    style: 2, 
                                    customId: 'backGroup', 
                                    label: 'Назад'
                                }
                            ]
                        }
                    ]
                }).catch(() => {});

                const editPermitionsAction = (async (newI) => {

                    fields = [];
                    idGroup = parameters.group;
    
                    for (let pickPermition in parameters.pickGroups) {
                
                        access[idGroup].permitions[parameters.pickGroups[pickPermition]].action = Number (newI.values[0]);
                        let pickPermitionFetch = access[idGroup].permitions[parameters.pickGroups[pickPermition]];
                        
                        fields.push(
                            {
                                name: `${pickPermitionFetch.name}`,
                                value: `${pickPermitionFetch.action == 0 ? 'Игнорировать' : pickPermitionFetch.action == 1 ? 'Отмена' : pickPermitionFetch.action == 2 ? 'Предупреждение' : pickPermitionFetch.action == 3 ? 'Предупреждение + Отмена' : pickPermitionFetch.action == 4 ? 'Карантин' : pickPermitionFetch.action == 5 ? 'Карантин + Отмена' : 'Неизвестно'} `,
                                inline: true
                            }
                        );
                
                    };

                    newI.update({
                        embeds: [
                            {
                                title: `${client.user.username + " setup"}`,
                                color: appearance.embed.color,
                                description: `${member}, выберите **необходимые** права для групп(ы)\nГруппа: **${access[idGroup].name}** (**${access[idGroup].warnings}**/${hourTranslatorBold (access[idGroup].warningsTime)})`,
                                thumbnail: { url: memberAvatar },
                                fields: fields
                            }
                        ], 
                        components: [
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 3,
                                        customId: 'editPermitionsAction', 
                                        placeholder: `Выберите необходимое противодейсвие для групп(ы) — ${fields.length}`, 
                                        minValues: 1, 
                                        maxValues: 1, 
                                        options: [
                                            {
                                                label: `Игнорировать`, 
                                                value: '0', 
                                                default: Number (newI.values[0]) == 0
                                            },
                                            {
                                                label: `Отмена`, 
                                                value: '1', 
                                                default: Number (newI.values[0]) == 1
                                            },
                                            {
                                                label: `Предупреждение`, 
                                                value: '2', 
                                                default: Number (newI.values[0]) == 2
                                            },
                                            {
                                                label: `Предупреждение + Отмена`, 
                                                value: '3', 
                                                default: Number (newI.values[0]) == 3
                                            },
                                            {
                                                label: `Карантин`, 
                                                value: '4', 
                                                default: Number (newI.values[0]) == 4
                                            },
                                            {
                                                label: `Карантин + Отмена`, 
                                                value: '5',
                                                default: Number (newI.values[0]) == 5
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                type: 1,
                                components: [
                                    {
                                        type: 2, 
                                        style: 2, 
                                        customId: 'backGroup', 
                                        label: 'Назад'
                                    }
                                ]
                            }
                        ]
                    }).catch(() => {});

                });

                actions['editPermitionsAction'] = {
                    actions: [editPermitionsAction],
                    all: false
                };

                break;

            }

            default: {

                if (actions[i.customId] && actions[i.customId].all == false) await actions[i.customId].actions[0](i);

                break;

            }
            
        };

    });

};