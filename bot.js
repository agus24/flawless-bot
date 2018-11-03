"use strict";
let Discord = require("discord.js");
const { Client, RichEmbed } = require('discord.js');
let config = require("./auth.json");
let fs = require('fs');

const client = new Discord.Client();

let prefix = "!!";
client.login(config.token);

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (message.content.startsWith(prefix + "gwh-list")) {
    fs.readFile('tmp/gwh.json', (err, data) => {
        let dt = JSON.parse(data);
        if(!dt.length == 0) {
            var value = ''
            for(let i = 0 ; i < dt.length ; i++) {
                value += (dt[i].id)+`. `+dt[i].IGN+" ("+dt[i].JOB+")\n";
            }
            const embed = new RichEmbed()
              .setTitle('GWH MEMBER LIST')
              .setColor(0xFF0000)
              .setDescription(value);
              message.channel.send(embed);
        } else {
            message.channel.sendMessage("List Empty.");
        }
    });
  } else if(message.content.startsWith(prefix + "register-gwh")) {
    let member = message.content.split(" ")[1];
    member = member.split("|");
    if(member[1] == undefined) {
        message.channel.sendMessage("Butuh job bwt register.");
    } else {
        fs.readFile('tmp/gwh.json', (err, data) => {
            if(err) throw err;
            let gwhData = JSON.parse(data);
            if(!(findJson(gwhData, member[0], 'IGN')+1)) {
                if(roleCheck(member[1])) {
                    let lastId = getLastId(gwhData);
                    gwhData.push({"IGN" : member[0], "JOB" : member[1], "id" : lastId});
                    let json = JSON.stringify(gwhData);
                    fs.writeFileSync('tmp/gwh.json', json);
                    message.channel.sendMessage("@"+message.author.username + "#" + message.author.discriminator+" "+member[0] + " ("+member[1]+") has been added.");
                } else {
                    message.channel.sendMessage("Nulis role tolong yg bener ya kakak. :)");
                }
            } else {
                message.channel.sendMessage(member[0] + " ga bisa daftar 2x bangsat.");
            }
        });
    }
  } else if(message.content.startsWith(prefix + "help")) {
    const embed = new RichEmbed()
      .setTitle('HELP')
      .setColor(0xFF0000)
      .setDescription("!!gwh-list [Bwt liat daftar gwh]\n\
        !!register-gwh [Format IGN|Job]\n\
        !!clear-list [bwt bersihin list]");
      message.channel.send(embed);
  } else if(message.content.startsWith(prefix + "clear-list")) {
    fs.readFile('tmp/gwh.json', (err, data) => {
        if(err) throw err;
        fs.writeFileSync('tmp/gwh.json', JSON.stringify([]));
        message.channel.sendMessage("List Cleared");
    });
  } else if (message.content.startsWith(prefix + "party add")) {
        fs.readFile('tmp/party.json', (err, data) => {
            let dt = JSON.parse(data);
            let member = message.content.split(" ")[2];
            let party = member.split("|")[0]
            let user = member.split("|")[1]
            if(findJson(dt, party, "party_name")+1) {
                let key = findJson(dt, party, "party_name");
                if(findJson(dt[key].member, user, "username")+1) {
                    message.channel.sendMessage("User Sudah Terdaftar");
                } else {
                    dt[key].member.push({"username" : user});
                }
            } else {
                dt.push({"party_name":party,"member":[{"username":user}]});
            }
            console.log(party);
            fs.writeFileSync('tmp/party.json', JSON.stringify(dt));
            message.channel.sendMessage("User "+ user +" Didaftarkan ke "+party);
        });
    }
    else if (message.content.startsWith(prefix + "party list")) {
        fs.readFile('tmp/party.json', (err, data) => {
            let dt = JSON.parse(data);
            for(let i = 0 ; i < dt.length; i++) {
                let member = '';
                for(let j = 0 ; j < dt[i].member.length ; j++) {
                    member += (j+1)+`. `+dt[i].member[j].username+`\n`
                }
                const embed = new RichEmbed()
                  .setTitle(dt[i].party_name)
                  .setColor(0xFF0000)
                  .setDescription(member);
                  message.channel.send(embed);
            }
        });
    }
    else if (message.content.startsWith(prefix + "party remove")) {
        fs.readFile('tmp/party.json', (err, data) => {
            let dt = JSON.parse(data);
            let member = message.content.split(" ")[2];
            let party = member.split("|")[0];
            let user = member.split("|")[1];

            if(findJson(dt, party, "party_name")+1) {
                let key = findJson(dt, party, "party_name");
                console.log(key);
                if(findJson(dt[key].member, user, "username")+1) {
                    let key2 = findJson(dt[key].member, user, "username");
                    console.log(dt[key].member[key2])
                    dt[key].member.splice(key2, 1);
                    fs.writeFileSync('tmp/party.json', JSON.stringify(dt));
                    message.channel.sendMessage("Member "+user+" Telah di remove dari party "+party);
                } else {
                    message.channel.sendMessage("Usernya ga ketemu bangsat.");
                }
            } else {
                message.channel.sendMessage("Itu party guild mana bangsat? ga ketemu sama gw.");
            }
        });
    }

    else if (message.content.startsWith(prefix + "party delete")) {
        fs.readFile('tmp/party.json', (err, data) => {
            let dt = JSON.parse(data);
            let member = message.content.split(" ")[2];
            let party = member.split("|")[0];

            if(findJson(dt, party, "party_name")+1) {
                let key = findJson(dt, party, "party_name");
                dt.splice(key, 1);
                fs.writeFileSync('tmp/party.json', JSON.stringify(dt));
                message.channel.sendMessage("Party "+party+" uda gw delete ya.");
            } else {
                message.channel.sendMessage("Itu party guild mana bangsat? ga ketemu sama gw.");
            }
        });
    } else if (message.content.startsWith(prefix + "say")) {
        message.channel.sendMessage(mutiara());
    }
});

function mutiara() {
    let kata = ["Tolong rawat saya ya kakak :)", "Lagi sange nih"]
    return Math.floor(Math.random() * Math.floor(kata.length-1))
}

function findJson(json, data, key) {
    for(let i = 0 ; i < json.length ; i++) {
        if(json[i][key] == data) {
            return i;
        }
    }
    return -1;
}

function getLastId(json) {
    return json[json.length - 1] == undefined ? 1 : json[json.length - 1].id+1
}

function roleCheck(role) {
    let roles = ["Berserker", "Swordmaster", "Crusader", "Renegade", "Templar", "Apostle", "Demolitionist", "Artisan", "Gambler", "Assassin", "Ice Wizard", "Fire Wizzard"];
    for(let i = 0 ; i < roles.length ; i++) {
        if(roles[i] == role) {
            return true;
        }
    }
    return false;
}
