const Discord = require('discord.js')
var ServerTap_API = process.env.PUREVANILLA_SERVER_ENDPOINT || 'localhost:25566'
var key = process.env.API_KEY;
var Current_Competition = "dec2";

module.exports.run = async (bot, interaction) => {
    var unirest = require("unirest");
    
    if(interaction.data.options) {
        Current_Competition = interaction.data.options[0].value
    }
    
    var req = unirest("GET", `${ServerTap_API}/v1/scoreboard/` + Current_Competition);

    req.headers({
        "content-type": "application/x-www-form-urlencoded",
        "accept": "application/json",
        "key": key
    });

    req.end(function (res) {
        if (res.error) {
            console.log(`Error getting /v1/scoreboard/:, ${res.error}`);
            bot.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: {
                  content: `Could not reach server`
                  }
                }
            })
        } else if (res.status == 200) {
            var scoreboard = res.body.scores
            scoreboard = scoreboard.sort(compare);
            //console.log(scoreboard);

            var finalMSG = "**Weekly Competition Scores:**  \n*" + res.body.displayName + ` | ID: ${Current_Competition}*`;
            var i = 0;
            for (let val of scoreboard) {
                i++;
                if (i < 11) {
                    console.log(val.entry)
                    var extra = "";

                    if (i == 1) {
                        extra = "🥇";
                    } else if (i == 2) {
                        extra = "🥈";
                    } else if (i == 3) {
                        extra = "🥉";
                    } else {
                        extra = "  " + i + ". "
                    }
                    finalMSG = finalMSG + "\n" + extra + " " + val.entry + "  `" + val.value + '`';
                }
            }

        }
        bot.api.interactions(interaction.id, interaction.token).callback.post({data: {
            type: 4,
            data: {
              content: `${finalMSG}`
              }
            }
        })
    });
}
function compare(a, b) {
    if (a.value < b.value) {
      return 1;
    }
    if (a.value > b.value) {
      return -1;
    }
    return 0;
  }
module.exports.help = {
    name: "weekly",
    aliases: ["comp"]
}