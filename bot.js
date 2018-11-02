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
    fs.readFile('gwh.json', (err, data) => {
        let dt = JSON.parse(data);
        if(!dt.length == 0) {
            var value = ''
            for(let i = 0 ; i < dt.length ; i++) {
                value += (i+1)+`. `+dt[i].IGN+" ("+dt[i].JOB+")\n";
            }
            const embed = new RichEmbed()
              // Set the title of the field
              .setTitle('GWH MEMBER LIST')
              // Set the color of the embed
              .setColor(0xFF0000)
              // Set the main content of the embed
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
        fs.readFile('gwh.json', (err, data) => {
            if(err) throw err;
            let gwhData = JSON.parse(data);
            if(!findJson(gwhData, member[0], 'IGN')) {
                gwhData.push({"IGN" : member[0], "JOB" : member[1]});
                let json = JSON.stringify(gwhData);
                fs.writeFileSync('gwh.json', json);
                message.channel.sendMessage(member[0] + " ("+member[1]+") has been added.");
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
    message.channel.sendMessage(member[0] + " ga bisa daftar 2x bangsat.");
  } else if(message.content.startsWith(prefix + "clear-list")) {
    fs.readFile('gwh.json', (err, data) => {
        if(err) throw err;
        fs.writeFileSync('gwh.json', JSON.stringify([]));
        message.channel.sendMessage("List Cleared");
    });
  }
});

function findJson(json, data, key) {
    for(let i = 0 ; i < json.length ; i++) {
        if(json[i][key] == data) {
            return true
        }
    }
    return false;
}
