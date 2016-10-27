var Discord = require("discord.js");
var bot = new Discord.Client();
var token = require('./token.js');
var fs = require('fs');

try {
	var urban = require("urban");
} catch (e){
	console.log("couldn't load urban plugin!\n"+e.stack);
}

try {
	var leet = require("leet");
} catch (e){
	console.log("couldn't load leet plugin!\n"+e.stack);
}

if (msg.content.startsWith("(╯°□°）╯︵ ┻━┻")) {
  msg.content.sendMessage("┬─┬﻿ ノ( ゜-゜ノ)");
}

try {
	var yt = require("./youtube_plugin");
	var youtube_plugin = new yt();
} catch(e){
	console.log("couldn't load youtube plugin!\n"+e.stack);
}

try {
	var wa = require("./wolfram_plugin");
	var wolfram_plugin = new wa();
} catch(e){
	console.log("couldn't load wolfram plugin!\n"+e.stack);
}

// Get authentication data
try {
	var AuthDetails = require("./auth.json");
} catch (e){
	console.log("Please create an auth.json like auth.json.example with a bot token or an email and password.\n"+e.stack);
	process.exit();
}

// Load custom permissions
var dangerousCommands = ["eval","pullanddeploy","setUsername"];
var Permissions = {};
try{
	Permissions = require("./permissions.json");
} catch(e){
	Permissions.global = {};
	Permissions.users = {};
}

for( var i=0; i<dangerousCommands.length;i++ ){
	var cmd = dangerousCommands[i];
	if(!Permissions.global.hasOwnProperty(cmd)){
		Permissions.global[cmd] = false;
	}
}
Permissions.checkPermission = function (user,permission){
	try {
		var allowed = true;
		try{
			if(Permissions.global.hasOwnProperty(permission)){
				allowed = Permissions.global[permission] === true;
			}
		} catch(e){}
		try{
			if(Permissions.users[user.id].hasOwnProperty(permission)){
				allowed = Permissions.users[user.id][permission] === true;
			}
		} catch(e){}
		return allowed;
	} catch(e){}
	return false;
}
fs.writeFile("./permissions.json",JSON.stringify(Permissions,null,2));

//load config data
var Config = {};
try{
	Config = require("./config.json");
} catch(e){ //no config file, use defaults
	Config.debug = false;
	Config.commandPrefix = 'jarvis ';
	try{
		if(fs.lstatSync("./config.json").isFile()){
			console.log("WARNING: config.json found but we couldn't read it!\n" + e.stack);
		}
	} catch(e2){
		fs.writeFile("./config.json",JSON.stringify(Config,null,2));
	}
}
if(!Config.hasOwnProperty("commandPrefix")){
	Config.commandPrefix = 'jarvis ';
}

var qs = require("querystring");

var d20 = require("d20");

var htmlToText = require('html-to-text');

var startTime = Date.now();

var giphy_config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/random",
    "permission": ["NORMAL"]
};


//https://api.imgflip.com/popular_meme_ids
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
	"awkwardpenguin": 61584
};

var poll = []
var ActivePoll = false

bot.on('warn', (m) => console.log('[warn]', m));
bot.on('debug', (m) => console.log('[debug]', m));

var commands = {
  "ping": {
    description: "Pong!",
    process: function(bot, msg, suffix) {
      msg.channel.sendMessage("Pong!");
    }
  },
  "troll": {
    usage: "[user to troll]",
        description: "Trolls the @mentioned User!",
    process: function(bot, msg, suffix) {
      let victim1 = msg.mentions.users.first();
      let victim = msg.guild.member(victim1);
      if (!victim.voiceChannel) {
        msg.channel.sendMessage('Error: It didn\'t work!\nThe vicitm needs to be connected to a voice channel, Silly Billy! :stuck_out_tongue_winking_eye:')
        .catch(console.log);
      } else {
        console.log('trolling ' + victim1)
        var trolls = {
          0 : "./lib/Sounds/Air Horn.mp3",
          1 : "./lib/Sounds/Rick Roll.mp3",
          2 : "./lib/Sounds/Pokemon Go.mp3",
          3 : "./lib/Sounds/Sandstorm.mp3"
        };
        var randomTroll = trolls[Math.floor(Math.random() * (3 - 0 + 1) + 0)];
        var voiceChannel = victim.voiceChannel;
        voiceChannel.join()
        .then(connection => {
          console.log('Connected!');
          const dispatcher = connection.playFile(randomTroll)
        })
        .catch(console.log);

        var texts = {
          0 : "HA NERD!",
          1 : "LOL",
          2 : "Trololololol",
          3 : "Get trolled M8!",
<<<<<<< HEAD
          4 : "O Sh*t boi waddup!",
=======
          4 : "Sh*t boi waddup!",
>>>>>>> origin/Blorp
          5 : "Reeeeeeeeeemed!"
        }
        var randomText = texts[Math.floor(Math.random() * (5 - 0 + 1) + 0)];
        msg.channel.sendMessage(randomText);
      }
    }
  },
  "stop": {
    description: "Disconnects JARVIS from all voice connections",
    process: function(bot, msg, suffix) {
      msg.guild.voiceConnection.disconnect()
      console.log('Disconnected!');
    }
  },
  "gif": {
    usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
    process: function(bot, msg, suffix) {
        var tags = suffix.split(" ");
        get_gif(tags, function(id) {
      if (typeof id !== "undefined") {
          msg.channel.sendMessage( "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
      }
      else {
          msg.channel.sendMessage( "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
      }
        });
    }
  },
  "myid": {
      description: "returns the user id of the sender",
      process: function(bot,msg){msg.channel.sendMessage(msg.author.id);}
  },
  "idle": {
      usage: "[status]",
      description: "sets bot status to idle",
      process: function(bot,msg,suffix){ bot.user.setStatus("idle", 'JARVIS | jarvis help');}
  },
  "online": {
      usage: "[status]",
      description: "sets bot status to online",
      process: function(bot,msg,suffix){ bot.user.setStatus("online", 'JARVIS | jarvis help');}
  },
  "youtube": {
      usage: "<video tags>",
      description: "gets youtube video matching tags",
      process: function(bot,msg,suffix){
          youtube_plugin.respond(suffix,msg.channel,bot);
      }
  },
  "say": {
      usage: "<message>",
      description: "bot says message",
      process: function(bot,msg,suffix){ msg.channel.sendMessage(suffix);}
  },
  "announce": {
      usage: "<message>",
      description: "bot says message with text to speech",
      process: function(bot,msg,suffix){ msg.channel.sendMessage(suffix,{tts:true});}
  },
  "pullanddeploy": {
      description: "bot will perform a git pull master and restart with the new code",
      process: function(bot,msg,suffix) {
          msg.channel.sendMessage("fetching updates...").then(function(sentMsg){
              console.log("updating...");
            var spawn = require('child_process').spawn;
              var log = function(err,stdout,stderr){
                  if(stdout){console.log(stdout);}
                  if(stderr){console.log(stderr);}
              };
              var fetch = spawn('git', ['fetch']);
              fetch.stdout.on('data',function(data){
                  console.log(data.toString());
              });
              fetch.on("close",function(code){
                  var reset = spawn('git', ['reset','--hard','origin/master']);
                  reset.stdout.on('data',function(data){
                      console.log(data.toString());
                  });
                  reset.on("close",function(code){
                      var npm = spawn('npm', ['install']);
                      npm.stdout.on('data',function(data){
                          console.log(data.toString());
                      });
                      npm.on("close",function(code){
                          console.log("goodbye");
                          sentMsg.edit("brb!").then(function(){
                              bot.destroy().then(function(){
                                  process.exit();
                              });
                          });
                      });
                  });
              });
          });
      }
  },
  "version": {
      description: "returns the git commit this bot is running",
      process: function(bot,msg,suffix) {
          var commit = require('child_process').spawn('git', ['log','-n','1']);
          commit.stdout.on('data', function(data) {
              msg.channel.sendMessage(data);
          });
          commit.on('close',function(code) {
              if( code != 0){
                  msg.channel.sendMessage("failed checking git version!");
              }
          });
      }
  },
  "log": {
      usage: "<log message>",
      description: "logs message to bot console",
      process: function(bot,msg,suffix){console.log(msg.content);}
  },
  "wiki": {
      usage: "<search terms>",
      description: "returns the summary of the first matching search result from Wikipedia",
      process: function(bot,msg,suffix) {
          var query = suffix;
          if(!query) {
              msg.channel.sendMessage("usage: " + Config.commandPrefix + "wiki search terms");
              return;
          }
          var Wiki = require('wikijs');
          new Wiki().search(query,1).then(function(data) {
              new Wiki().page(data.results[0]).then(function(page) {
                  page.summary().then(function(summary) {
                      var sumText = summary.toString().split('\n');
                      var continuation = function() {
                          var paragraph = sumText.shift();
                          if(paragraph){
                              msg.channel.sendMessage(paragraph,continuation);
                          }
                      };
                      continuation();
                  });
              });
          },function(err){
              msg.channel.sendMessage(err);
          });
      }
  },
  "userid": {
    usage: "[user to get id of]",
    description: "Returns the unique id of a user. This is useful for permissions.",
    process: function(bot,msg,suffix) {
      if(suffix){
        var users = msg.channel.guild.members.filter((member) => member.user.username == suffix).array();
        if(users.length == 1){
          msg.channel.sendMessage( "The id of " + users[0].user.username + " is " + users[0].user.id)
        } else if(users.length > 1){
          var response = "multiple users found:";
          for(var i=0;i<users.length;i++){
            var user = users[i];
            response += "\nThe id of <@" + user.id + "> is " + user.id;
          }
          msg.channel.sendMessage(response);
        } else {
          msg.channel.sendMessage("No user " + suffix + " found!");
        }
      } else {
        msg.channel.sendMessage( "The id of " + msg.author + " is " + msg.author.id);
      }
    }
  },
  "eval": {
    usage: "<command>",
    description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission',
    process: function(bot,msg,suffix) {
      if(Permissions.checkPermission(msg.author,"eval")){
        msg.channel.sendMessage( eval(suffix,bot));
      } else {
        msg.channel.sendMessage( msg.author + " doesn't have permission to execute eval!");
      }
    }
  },
  "roll": {
        usage: "[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)",
        description: "roll one die with x sides, or multiple dice using d20 syntax. Default value is 10",
        process: function(bot,msg,suffix) {
            if (suffix.split("d").length <= 1) {
                msg.channel.sendMessage(msg.author + " rolled a " + d20.roll(suffix || "10"));
            }
            else if (suffix.split("d").length > 1) {
                var eachDie = suffix.split("+");
                var passing = 0;
                for (var i = 0; i < eachDie.length; i++){
                    if (eachDie[i].split("d")[0] < 50) {
                        passing += 1;
                    };
                }
                if (passing == eachDie.length) {
                    msg.channel.sendMessage(msg.author + " rolled a " + d20.roll(suffix));
                }  else {
                    msg.channel.sendMessage(msg.author + " tried to roll too many dice at once!");
                }
            }
        }
  },
  "urban": {
      usage: "<word>",
      description: "looks up a word on Urban Dictionary",
      process: function(bot,msg,suffix){
          var targetWord = suffix == "" ? urban.random() : urban(suffix);
          targetWord.first(function(json) {
              if (json) {
                var message = "Urban Dictionary: **" +json.word + "**\n\n" + json.definition;
                if (json.example) {
                    message = message + "\n\n__Example__:\n" + json.example;
                }
                msg.channel.sendMessage( message);
              } else {
                msg.channel.sendMessage( "No matches found");
              }
          });
      }
  },
  "leet": {
    usage: "<message>",
    description: "converts boring regular text to 1337",
    process: function(bot,msg,suffix){
        msg.channel.sendMessage( leet.convert(suffix));
    }
  },
  "twitch": {
    usage: "<stream>",
    description: "checks if the given stream is online",
    process: function(bot,msg,suffix){
      require("request")("https://api.twitch.tv/kraken/streams/"+suffix,
      function(err,res,body){
        var stream = JSON.parse(body);
        if(stream.stream){
          msg.channel.sendMessage( suffix
            +" is online, playing "
            +stream.stream.game
            +"\n"+stream.stream.channel.status
            +"\n"+stream.stream.preview.large)
        }else{
          msg.channel.sendMessage( suffix+" is offline")
        }
      });
    }
  },
  "uptime": {
    usage: "",
    description: "returns the amount of time since the bot started",
    process: function(bot,msg,suffix){
      var now = Date.now();
      var msec = now - startTime;
      console.log("Uptime is " + msec + " milliseconds");
      var days = Math.floor(msec / 1000 / 60 / 60 / 24);
      msec -= days * 1000 * 60 * 60 * 24;
      var hours = Math.floor(msec / 1000 / 60 / 60);
      msec -= hours * 1000 * 60 * 60;
      var mins = Math.floor(msec / 1000 / 60);
      msec -= mins * 1000 * 60;
      var secs = Math.floor(msec / 1000);
      var timestr = "";
      if(days > 0) {
        timestr += days + " days ";
      }
      if(hours > 0) {
        timestr += hours + " hours ";
      }
      if(mins > 0) {
        timestr += mins + " minutes ";
      }
      if(secs > 0) {
        timestr += secs + " seconds ";
      }
      msg.channel.sendMessage("**Uptime**: " + timestr);
    }
  },
	"startpoll": {
			usage: "[choice a], [choice b], [choice c]",
			description: "starts a poll.",
			process: function(bot,msg,suffix){
				if (ActivePoll) {
					msg.channel.sendMessage('Sorry, There is already an active poll!');
				} else {
					ActivePoll = true
					info = ''
					test1 = ''
					opts = suffix.split(',');
					for (var i = 0; i < opts.length; i++) {
						poll[opts[i]] = 0
					}
					for (var i in poll) {
						info += i + ' - ' + poll[i] + ' votes\n'
					}
					msg.channel.sendMessage('Poll Successfully Created!\n```\n' + info + '```');
					console.log(info);
				}
			}
	},
	"viewpoll": {
			description: "view poll.",
			process: function(bot,msg,suffix){
				if (!ActivePoll) {msg.channel.sendMessage('There is no active poll!')}
				else {msg.channel.sendMessage('Current stats are:\n```\n' + info + '```');}
			}
	},
	"endpoll": {
			description: "ends poll.",
			process: function(bot,msg,suffix){
				if (!ActivePoll) {
					msg.channel.sendMessage('There is no poll to end!');
				} else {
					msg.channel.sendMessage('The final results are:\n```\n' + info + '```');
					info = ''
					poll = ''
					ActivePoll = false
				}
			}
	},
	"vote": {
			usage: "[name of option]",
			description: "vote in a poll.",
			process: function(bot,msg,suffix){
				if (!ActivePoll) {
					msg.channel.sendMessage('There is no active poll.');
				} else {
					poll[suffix] += 1
					info = ''
					for (var i in poll) {
						info += i + ' - ' + poll[i] + ' votes\n'
					}
					msg.channel.sendMessage('voted for' + suffix);
				}
			}
	},
	"yesno": {
			description: "say yes or no.",
			process: function(bot,msg,suffix){
				var yesno = Math.floor(Math.random() * (2 - 1 + 1) + 0);
				console.log(yesno);
				if (yesno == 1) {
					var tags = [ '', 'yes' ];
	        get_gif(tags, function(id) {
	      		if (typeof id !== "undefined") {
	          	msg.channel.sendMessage( "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
	      		}
	      		else {
	          	msg.channel.sendMessage( "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
	      		}
	        });
				} else {
					var tags = [ '', 'no' ];
	        get_gif(tags, function(id) {
	      if (typeof id !== "undefined") {
	          msg.channel.sendMessage( "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
	      }
	      else {
	          msg.channel.sendMessage( "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
	      }
	        });
				}
			}
	},
	"google"
	usage: ""
	description: "search on google"
	process: const superagent = require('superagent');
const cheerio = require('cheerio');
const querystring = require('querystring');

const fallback = async (message, args, safe, client) => {
  let url = https://www.google.com/search?safe=${safe}&q=${encodeURI(args)};
  superagent.get(url).end((err, res) => {
    if (err) client.error(err);
    const $ = cheerio.load(res.text);
    const href = $('.r').first().find('a').first().attr('href');
    try {
      const result = Object.keys(querystring.parse(href.substr(7, href.length)))[0];
      if (result !== '?q') message.edit(result).catch(() => message.edit('No results found!'));
      else message.edit('No results found!');
    } catch (err) {
      message.edit('No results found!');
    }
  });
}

module.exports = {
  main: async message => {
    const client = message.client;
    const args = message.content.trimLeft();
    const msg = await message.channel.sendMessage('Searching...');
    const key = client.keys.getKey();
    const s = await client.rethink.fetchGuild(msg.guild.id);
    const safeSetting = s ? {1: 'off', 2: 'medium', 3: 'high'}[parseInt(s.nsfw)] : 'medium';
    const safe = msg.channel.name.includes('nsfw') ? 'off' : safeSetting;
    client.log('Search:', msg.guild.name, msg.guild.id, '|', args, '|', safe, '|', key, client.keys.lastKey);
    let url = https://www.googleapis.com/customsearch/v1?key=${key}&cx=${client.config.google.cx}&safe=${safe}&q=${encodeURI(args)};
    superagent.get(url).end((err, res) => {
      if (err) {
        return fallback(msg, args, safe, client);
      }
      msg.edit(JSON.parse(res.text)['items'][0]['link']).catch(err => {
        if (err) {
          return fallback(msg, args, safe, client);
        }
      });
    });
  },
  args: '<query>',
  help: 'Search billions of web pages',
  catagory: 'general'
};
}


function checkMessageForCommand(msg, isEdit) {
	//check if message is a command
	if (msg.content.startsWith("(╯°□°）╯︵ ┻━┻")) {
	 (msg.channel.sendMessage("┬─┬﻿ ノ( ゜-゜ノ)"));
}
//this is the table flip command
	if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))){
        console.log("treating " + msg.content + " from " + msg.author.username + "\(" + msg.author + "\) as command");
		var cmdTxt = msg.content.split(" ")[1];
        var suffix = msg.content.substring(cmdTxt.length+7);//add six for the 'jarvis' and one for the space
        if(msg.isMentioned(bot.user)){
			try {
				cmdTxt = msg.content.split(" ")[1];
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+7);
			} catch(e){ //no command
				msg.channel.sendMessage("Yes?");
				return;
			}
        }
		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
						if(suffix){
							var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
							var info = "";
							for(var i=0;i<cmds.length;i++) {
								var cmd = cmds[i];
								info += "**"+Config.commandPrefix + cmd+"**";
								var usage = commands[cmd].usage;
								if(usage){
									info += " " + usage;
								}
								var description = commands[cmd].description;
								if(description instanceof Function){
									description = description();
								}
								if(description){
									info += "\n\t" + description;
								}
								info += "\n"
							}
							msg.channel.sendMessage(info);
						} else {
							msg.author.sendMessage("**Available Commands:**").then(function(){
								var batch = "";
								var sortedCommands = Object.keys(commands).sort();
								for(var i in sortedCommands) {
									var cmd = sortedCommands[i];
									var info = "**"+Config.commandPrefix + cmd+"**";
									var usage = commands[cmd].usage;
									if(usage){
										info += " " + usage;
									}
									var description = commands[cmd].description;
									if(description instanceof Function){
										description = description();
									}
									if(description){
										info += "\n\t" + description;
									}
									var newBatch = batch + "\n" + info;
									if(newBatch.length > (1024 - 8)){ //limit message length
										msg.author.sendMessage(batch);
										batch = info;
									} else {
										batch = newBatch
									}
								}
								if(batch.length > 0){
									msg.author.sendMessage(batch);
								}
						});
					}
        }
		else if(cmd) {
			if(Permissions.checkPermission(msg.author,cmdTxt)){
				try{
					cmd.process(bot,msg,suffix,isEdit);
				} catch(e){
					var msgTxt = "command " + cmdTxt + " failed :(";
					if(Config.debug){
						 msgTxt += "\n" + e.stack;
					}
					msg.channel.sendMessage(msgTxt);
				}
			} else {
				msg.channel.sendMessage("You are not allowed to run " + cmdTxt + "!");
			}
		} else {
			msg.channel.sendMessage(cmdTxt + " not recognized as a command!").then((message => message.delete(5000)))
		}
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }

        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                msg.channel.sendMessage(msg.author + ", you called?");
        } else {

				}
    }
}

bot.on("message", msg => checkMessageForCommand(msg, false));

bot.on("presence", function(user,status,gameId) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(user+" went "+status);
	//}
	try{
	if(status != 'offline'){
		if(messagebox.hasOwnProperty(user.id)){
			console.log("found message for " + user.id);
			var message = messagebox[user.id];
			var channel = bot.channels.get("id",message.channel);
			delete messagebox[user.id];
			updateMessagebox();
			bot.sendMessage(channel,message.content);
		}
	}
	}catch(e){}
});

function get_gif(tags, func) {
        //limit=1 will only return 1 gif
        var params = {
            "api_key": giphy_config.api_key,
            "rating": giphy_config.rating,
            "format": "json",
            "limit": 1
        };
        var query = qs.stringify(params);

        if (tags !== null) {
            query += "&tag=" + tags.join('+')
        }

        //wouldnt see request lib if defined at the top for some reason:\
        var request = require("request");
        //console.log(query)
        request(giphy_config.url + "?" + query, function (error, response, body) {
            //console.log(arguments)
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
                console.log(error);
                //console.log(response)
            }
            else {
                try{
                    var responseObj = JSON.parse(body)
                    func(responseObj.data.id);
                }
                catch(err){
                    func(undefined);
                }
            }
        }.bind(this));
}
exports.addCommand = function(commandName, commandObject){
    try {
        commands[commandName] = commandObject;
    } catch(err){
        console.log(err);
    }
}
exports.commandCount = function(){
    return Object.keys(commands).length;
}

bot.on('ready', () => {
	package = require('./package.json');
  console.log("Starting " + package.name + " " + package.version + "...\nLogged in! Serving in " + bot.guilds.array().length + " servers");
  require("./plugins.js").init();
  console.log("type "+Config.commandPrefix+"help in Discord for a commands list.");
  bot.user.setStatus("online", "JARVIS | jarvis help");
});

bot.login(token.token);
