const { join } = require('path');
let { stdin, stdout, hasUncaughtExceptionCaptureCallback} = require('process');
let sound = require("sound-play");
let
    chalk  = require('chalk'),
    worker = require('./worker.js'),
    wiodb = require('wio.db'),
    fs = require('fs'),
    helper = require('./helper'),
    db = new wiodb.JsonDatabase({databasePath: './jsmdb.json'});
let language = `./lang/${db.has('cli_lang') ? db.get('cli_lang') : 'english'}.json`
let _lang = require(language);
	/**
	* @desc unicode character to go up a line in the terminal.
	* @example ```
	* let go_up = upk;
	* console.log('%s I have gone up a line', go_up); //string formatting
	* //or: 
	* let go_up = upk;
	* console.log(`${go_up}I have gone up a line`);
	* ```
	* */
let upk = '\u001b[A\r';
	/**
	* @desc stop the process execution for `x` seconds
	* @this ; is a very bad piece of code. It hogs up the cpu to stop execution. unfortunately it is necessecary.
	* */
function sleep(ms = 0) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + ms);
}
let uid = function(length){
  return Date.now().toString(36) + Math.random().toString(36).substring(-length);
}
let currentErrors = 0;
let errorCounter = 0;
process.on('uncaughtException', err => {
  console.log(chalk.bold.red(`\n<${_lang.strings.exception.pkgloss}>\n<${err.message}>`));
  if (process.argv.includes('--dev')) console.log(chalk.bold.red(err.stack));
  errorCounter++;
  setTimeout(() => {
    if (errorCounter != currentErrors && errorCounter > 200) {
      console.log(chalk.bold.red(_lang.strings.exception.errloop))
      process.exit(0);
    } 
    currentErrors = errorCounter;
    console.log(chalk.bold.green(`\r<${_lang.strings.exception.reconnect}>\u001b[B`));
  }, 1000)
})

process.on('beforeExit', async() => {
  process.stdout.write('\n');
  if (!db.has('user')) {
    console.log(chalk.bold.red(_lang.strings.quit.quit_noacc));
    process.exit(0);
  }
  await helper.console.writing.ConsoleAnimation.$progress(chalk.bold.yellow(_lang.strings.quit.quit_1), 1, 150);
  await worker.user.logoutAsUser(db.get('user.id')).then(i => {
    console.log(chalk.bold.red('\r'+_lang.strings.quit.quit_2+'     '));
    process.exit(0);
  })
})
const util = require('../util/base')
module.exports = {
    async start(args = []) {
      if (args.includes('--join')) {
          let join_index = args.indexOf('--join');
          if (join_index == -1) return console.log('could not locate argument location: "--join" is not in args[]');
          let id = db.get('user.id');
          if (args.length == join_index+1) {console.log(chalk.bold.red('Provide a channel id.\nUsage:\n\tjsm --join #jsm')); process.exit(1);}
          if (!db.has('user')) {
            console.log(chalk.bold.red('Cannot quickjoin a channel without creating an account. Please create an account with \'jsm --account\'.'))
            process.exit(0);
          }
          let channel_id = args[join_index+1];
          console.log(_lang.strings.menu.ch.joining+channel_id+'...');
          await worker.user.loginAsUser(db.get('user.id'));
          let username = db.get('user.name');
          username = username.startsWith('@') ? `${chalk.yellow('[')+chalk.red('DEVELOPER')+chalk.yellow(']')} ${chalk.bold.red(db.get('user.name'))}` : db.get('user.name');
          let showChannel = require('./showChannel');
          showChannel(channel_id, username, 'fc');
          return;
      }
      var os = require('os');
      let isConnected = !!await require('dns').promises.resolve('mybutton.org').catch(()=>{});
      if (!isConnected && !process.argv.includes('--dev') && !process.argv.includes('--skip-update-check')) return console.log(chalk.bold.red('ENOCONNECTION: JSM could not connect to jsm.mybutton.org (internet connection fault?)'))
      let index = 0;
      let gnpv = require('get-npm-package-version')
      let execu=true;
      if (!process.argv.includes('--dev')) {
        console.log(chalk.bold.yellow('Checking for updates...'));
        let _lts = gnpv.getNpmPkgVersion('jsmessenger');
      if (_lts != require('../package.json').version) {
        execu = false;
        console.log(chalk.bold.green('JSM is out of date.'))
        console.log('Installing jsmessenger@'+_lts +'...');
        let child_process = require('child_process')
        let updater = await child_process.exec("npm install jsmessenger@latest --global")
        updater.stdout.on('data', data => {
          console.log(data);
        })
        updater.stdout.on('close', data => {
          require('../func/release').run([_lts]);
          console.log(chalk.bold.yellow('JSM has been updated.\nPlease Restart to continue.'));
          process.exit(0);
        })
        return;
      }
    }
      if (execu) {
        args.forEach(argmnt => {
          if (argmnt.startsWith("--dblocation=")) {
            let arg = args[index+0];
            let final = arg;
            if (final.startsWith('--dblocation=')) {
              if (fs.existsSync(final.replace('--dblocation=',''))) {
                db = new wiodb.JsonDatabase({databasePath: final.replace('--dblocation=','')})
                console.log(chalk.bold.green('Using database @ ' + final.replace('--dblocation=','')))
              } else {
                console.log(chalk.bold.red('db.initialize({location?: ..dblocation, {}?: ...Settings}): Unknown database: ' + final.replace('--dblocation=','')));
                console.log(chalk.bold.red('Using default path. [' + process.cwd() + ']'))
                sleep(2000)
              }
            }
          }
          index++;
        })
        if (db.has('user')) {
          await helper.console.writing.ConsoleAnimation.$turn(_lang.strings.initial.load_1, 50, 2)
          let loggedin = false;
          setTimeout(function () {
            if (!loggedin) console.log(chalk.bold.yellow('-- please wait, waking up JSM servers... (no other connections, servers offline currently) --'))
          }, 5000);
          let getResponse = await (await worker.user.getUserData(db.get('user.id'), 'online'));
          if (getResponse.response?.user_banned) return process.exit(1);
          if (getResponse.response) {
            console.log(chalk.bold.red('\r'+_lang.strings.initial.already_logged_in));
            loggedin = true;
            let rlf = require('readline').createInterface({
              input: process.stdin,
              output: process.stdout
            })

            rlf.question(' (y/n):', result => {
              if (result == 'y' || result == '\r') { rlf.close(); this.continue(args) }
              else {
                loggedin = true;
                rlf.close();
                console.log(chalk.bold.red('-- '+_lang.strings.initial.exit_login+' --'));
                process.exit(0);
              }
            })
          } else { this.continue(args); loggedin = true }
        } else {
          console.log(_lang.strings.initial.load_mkacc);
          sleep(1000);
          this.continue(args);
        }
      }
    },
	async continue(/** @desc Arguments for process.argv-2*/ args = []) {
      let frnsm = this.friendmenu;
      let chnlcr = this.channelCreation;
        console.clear();
        console.log(chalk.bold.yellow('JSM '+chalk.magenta(require('../package.json').version)+ chalk.blue('<standalone>')) + ' : ' + chalk.bold.magenta(_lang.strings.menu.welcome));
        if (!db.has('user')) {
          
          db.set('user.id',  uid(14)); //create a unique id for the current user if the user is not registered.
          var rl = require('readline').createInterface(
            {
              input: stdin,
              output: stdout
            }
          );
          rl.question(`${chalk.bold.blue(_lang.strings.input.mkacc_reg_uname)}${chalk.bold.magenta(': ')}`, regname => {
            let special_chars = [...' ğüçöı@%&/()=?_!\'^+>£#$½{[]}\\|,.₺æß'];
            if (regname.length < 3 ) {
              console.log(chalk.bold.red(_lang.strings.input.mkacc_uname_too_short));
              return this.continue(args);
            }
            special_chars.forEach(ch => {
              if (regname.includes(ch)) {
                console.log(chalk.bold.red('Your name contains the character ' + ch + ' which is an illegal character.'));
                return this.continue(args);
              }
            })
            if (regname.length < 3) {
              console.log(chalk.bold.red());
              sleep(3000);
              return this.start();
            }
            db.set('user.name', regname);
            console.log(chalk.bold.yellow(_lang.strings.initial.first_login+ chalk.bold.magenta(db.get('user.id')) + '.'));
            console.log(chalk.bold.yellow(_lang.strings.initial.first_login_2+chalk.bold.bgGray.yellow('friends')+_lang.strings.initial.first_login_3));
            sleep(1000);
            worker.user.registerUser(db.get('user.name'), db.get('user.id'));
            worker.user.loginAsUser(db.get('user.id'));
            rl.close();
            console.log(chalk.bold.green(_lang.strings.initial.restart));
            process.exit(0);
          })
        } else { idfk() };
        async function idfk() {
        worker.user.loginAsUser(db.get('user.id'));
        console.log(chalk.bold.redBright(_lang.strings.menu.info));
        let readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          var username = 'user' + Math.random().toString().substring(7); //generate a unique identifier for the user if it is not set
            readline.question(chalk.bold.magenta('>> ') + chalk.bold.yellow(chalk.bold.underline('execute a command or press enter to continue'))+ chalk.bold.magenta(':') + chalk.bold.white(' '), name => {
              if (name.length < 1) name = db.get('user.name');
              process.stdout.write('\u001b[A\r' + chalk.bold.magenta('>> ') + chalk.bold.green('execute a command or press enter to continue') + chalk.bold.magenta(':') + chalk.bold.green(' ' + name));
              
              if (name == 'friends') {
                readline.close();
                frnsm();
                return;
              }
              else if (name == 'mail') {
                readline.close();
                return require('./init').mail();
              }
              else if (name == 'help') {
                readline.close();
                console.log(chalk.bold.yellow('\nfriends') + ' : ' + chalk.bold.green('shows the friends menu.'));
                console.log(chalk.bold.yellow('quit') + '       : ' + chalk.bold.green('quits the application.'));
                console.log(chalk.bold.yellow('mail') + '       : ' + chalk.bold.green('shows the mail menu.'));
                console.log(chalk.bold.yellow('-- continuing in 10 seconds --'))
                sleep(10000);
                return require('./init').continue();
              }
              else if (name == 'quit') {
                worker.user.logoutAsUser(db.get('user.id'));
                console.log('quit JSM');
                process.exit(0);
              }
              else if (name?.length < 1 && name != '\r' && !name.startsWith('#nick:')) {
                console.log(chalk.bold.magenta('\n>> ') + chalk.bold.red(chalk.bold.underline(_lang.strings.menu.ucmd)));
                sleep(3000);
                readline.close()
                return require('./init').continue();
              }
              username = db.get('user.name');
              if (name.startsWith('#nick:')) username = name.replace('#nick:', '');
              if (username.startsWith('@')) username = chalk.red(`${chalk.bold.yellow('[')+chalk.red('DEVELOPER')+chalk.bold.yellow(']')} ` + username);
              if (username.startsWith('%')) username = chalk.bold.cyan(`${chalk.bold.yellow('['+chalk.bold.red('ADMIN')+']')} ` + username);
              readline.close();
              var first = true
              var second = false
              var result = 'first';
              var chc = chnlcr;
              function thisAgain() {
                console.clear();
                console.log(
                    chalk.bold.yellow('\t'+_lang.strings.menu.ch.info),
                    chalk.magenta(`\n\t\t\t\t\t${first ? chalk.underline.bold.dim(_lang.strings.menu.ch.new) : chalk.bold.whiteBright(_lang.strings.menu.ch.new)} ${second ? chalk.underline.bold.dim(_lang.strings.menu.ch.find) : chalk.bold.white(_lang.strings.menu.ch.find)}`)
                )
                try {
                  process.stdin.setRawMode(true);
                } catch {
                  console.clear();
                  console.log(chalk.bold.red(_lang.strings.exception.nosupport));
                  process.exit(1);
                }
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.once('data', function(key){
                  if (key == '\u001B\u005B\u0041') {
                      process.stdin.pause();
                      first = !first;
                      second = !second;
                      process.stdin.setRawMode(true);
                      process.stdin.resume();
                      process.stdin.setEncoding('utf8');
                      return thisAgain()
                  }
                  if (key == '\u001B\u005B\u0043') {
                      process.stdin.end();
                      first = !first;
                      second = !second;
                      process.stdin.resume();
                      process.stdin.setRawMode(true);
                      process.stdin.setEncoding('utf8');
                      return thisAgain()
                  }
                  if (key == '\u001B\u005B\u0042') {
                    process.stdin.pause();
                      first = !first;
                      second = !second;
                      process.stdin.setRawMode(true);
                      process.stdin.resume();
                      process.stdin.setEncoding('utf8');
                      return thisAgain()
                  }
                  if (key == '\u001B\u005B\u0044') {
                    process.stdin.pause();
                      first = !first;
                      second = !second;
                      process.stdin.setRawMode(true);
                      process.stdin.resume();
                      process.stdin.setEncoding('utf8');
                      return thisAgain()
                  }
                  if (key == 'b' || key == 'y') { 
                    console.log(chalk.bold.red(_lang.strings.exception.newkb))
                    console.log(chalk.bold.dim('-- continuing in 2 seconds --'))
                    sleep(2000);
                  }
                  if (key == '\b') {
                    return require('./init').continue();
                  }
                  if (key == '\r') {
                    result = first ? 'nc' : 'fc';
                    return chc(result, username);
                  }
                  if (key == '\u0003') { process.exit(); }    // ctrl-c
                  process.stdin.setRawMode(true);
                  process.stdin.resume();
                  process.stdin.setEncoding('utf8');
                  return thisAgain();
                });

              }
              thisAgain();
            });
          }

    },
    async channelCreation(type = 'nc', username = '') {
        let showChannel = require('./showChannel');
        if (type == 'nc') {
            let channel_name = 'channel_' + Math.random().toString().substring(7);
            let channel_id = '#' + Math.random().toString().substring(13);
            let readlinef = require('readline').createInterface({
            input:    process.stdin,
            output:    process.stdout
            })
            readlinef.question(chalk.bold.magenta('>>') + chalk.bold.blue(_lang.strings.menu.ch.nc.enter_name) + chalk.bold.magenta(': '), async name => {
                process.stdout.write('\u001b[A\r' + ' '.repeat(process.stdout.columns + 1));
                if (name.length < 1);
                else channel_name = name;
                readlinef.close();
                process.stdout.write(chalk.bold.yellow(_lang.strings.menu.ch.creating))
                let channelCreationInstance = await worker.createChannel(channel_name, channel_id);
                if (channelCreationInstance === 405) return console.log(chalk.bold.red('\rA channel by the identifier ' + channel_id + ' already exists! Auto-id Failed. Please re-create a channel.'))
                console.log(chalk.bold.green('\r'+_lang.strings.menu.ch.created+'        '))
                console.log(chalk.bold.yellow('>> Channel ID   :') + chalk.bold.magenta(channel_id))
                console.log(chalk.bold.yellow('>> Channel Name : ') + chalk.bold.magenta(channel_name)) 
                console.log(chalk.bold.green(_lang.strings.menu.ch.joining+chalk.bold.magenta(channel_id)+'...'))
                showChannel(channel_id, username, 'nc');
            });
        }
        if (type == 'fc') {
          var readlinef = require('readline').createInterface(
            {
              input: process.stdin,
              output: process.stdout
            }
          )
          readlinef.question(`${chalk.bold.magenta('>>')}${chalk.bold.yellow(' Enter channel  ' + chalk.bold.magenta(': '))}`, async function (key) {
            readlinef.close();
            console.log(chalk.bold.yellow(_lang.strings.menu.ch.connect + chalk.bold.magenta(key) + '...'));
            try {
              let data = await worker.getMessages(key.replace('#', ''));
            } catch {
              return console.log(chalk.bold.red('\u001b[A\r'+ _lang.strings.menu.ch.enoch + chalk.bold.magenta(key) + '.'));
            }
            
            let data = await worker.getMessages(key.replace('#', ''));
            if (data.status === 404 || data == 404) {
              return console.log(chalk.bold.red('\u001b[A\rNo such channel exists with the id ' + chalk.bold.magenta(key) + '.'));
            }
            process.stdout.write('\u001b[A\r' + ' '.repeat(process.stdout.columns + 1));
                if (key.length < 1);
                readlinef.close();
                let channel_id = key;
                await helper.console.writing.ConsoleAnimation.$progress(_lang.strings.menu.ch.joining+channel_id+'...', 100, 50);                
                showChannel(channel_id, username, 'fc');
              }); 
        }
    },
    async friendmenu() {
      console.clear();
      var user = {
        name : db.get('user.name'),
        id   : db.get('user.id')
      };
      console.clear();
      console.log(_lang.strings.menus.friends.load);
      let userfriends = await worker.user.getUserFriends(user.id);
      console.clear();
      console.log(chalk.bold.yellow('Welcome to the '+chalk.bold.magenta('Friends Menu.')))
      console.log(chalk.bold.yellow('To add someone as a friend, enter their '+ chalk.bold.magenta('UUID') + ' to the input.'))
      console.log(chalk.bold.yellow('Your UUID is: ' + chalk.bold.magenta(db.get('user.id'))));
      console.log(chalk.bold.blue('Friends ('+userfriends.response.length+'):'));
      if (userfriends.response.length < 1) console.log(chalk.bold.redBright('\t<empty>'))
      else {
        var friends = userfriends.response;

        for (var i = 0; i < friends.length; i++) {
          let friend = friends[i];
          let onlineStatus = friend.isOnline ? friend.isOnline : false;
          let friendName = friend.userName;
          console.log(onlineStatus ? chalk.bold.green('ON') : chalk.bold.red('OF'), onlineStatus ? chalk.bold.green(friendName) : chalk.bold.red(friendName), chalk.bold.dim('['+friend.id+']'));
        }
      }
      var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question(chalk.bold.green('Add friend (menu to return to the main menu): ' + chalk.bold.magenta('+')), async uuid => {
        if (uuid == 'menu') {
          rl.close();
          return require('./init').continue();
        }
        process.stdout.write(chalk.bold.yellow('checking user...'));
        if ((await worker.user.userExists(uuid)).response) {
          if (friends && friends.includes(uuid)) {
            console.log(chalk.bold.red(_lang.strings.menus.friends.ealrfr))
            sleep(2000);
            rl.close();
            return require('./init').friendmenu();
          }
          console.log('found user ['+await (await worker.user.getUserName(uuid)).response.uname+']');
          await worker.user.addFriend(user.id, uuid);
          console.log(chalk.bold.green('\r'+_lang.strings.menus.friends.addToList+ chalk.bold.magenta(await (await worker.user.getUserName(uuid)).response.uname) + _lang.strings.menus.friends.nowFriend))
          sleep(2000);
          rl.close();
          return require('./init').friendmenu();
        } else {
          console.log(chalk.bold.red('\r' + _lang.ERR_UNX));
          sleep(2000);
          rl.close();
          require('./init').friendmenu();
          return;
        }
      })
    },
    async mail() {
      console.log('\n'+_lang.strings.menus.mail.load);
      let mail = await (await worker.user.getUserMail(db.get('user.id'))).response;
      console.clear();
      console.log(chalk.bold.yellow('Welcome to the ' + chalk.bold.magenta('Mail Menu') + '.'));
      console.log(chalk.bold.yellow('Here you can view the mails you have in your inbox, or send one to another user.'));
      console.log(chalk.bold.blue('Mail ('+mail.length+'): '))
      for (let i = 0; i < mail.length; i++) {
        let mailcurrent = mail[i];
        let when = mailcurrent.time;
        if (!when) when = chalk.bold.underline('unknown date')
        console.log(chalk.bold.magenta('['+(i+1)+']'), chalk.bold.yellow(mailcurrent.author + ':'), chalk.bold.green(mailcurrent.title), ' @ ', chalk.bold.underline(when));
      }
      let rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      rl.question(chalk.bold.magenta('Select mail number to view ['+chalk.bold.underline.white('create')+' to send a mail, '+chalk.bold.underline.white('menu')+' to go back]: '), async mailID => {
        if (mailID == "menu") {
          rl.close();
          return require('./init').continue();
        }
        if (mailID == "create") {
          rl.close();
          return require('./init').sendMail();
        }
        if (mailID-1 >= mail.length) {
          console.log(chalk.bold.red('The mail id specified is higher than the mail count!'))
          rl.close();
          return require('./init').mail();
        } else {
          console.clear();
          if (isNaN(parseInt(mailID))) {
            console.log(chalk.bold.red('the input is not a number.'));
            sleep(1000);
            rl.close();
            return require('./init').mail();
          }
          let mailfile = mail[parseInt(mailID-1)];
          console.log(chalk.bold.yellow(mailfile.author), chalk.bold.green(mailfile.title));
          console.log(mailfile.content);
          rl.question(chalk.bold.yellow('-- press enter to return to homepage --'), () => {
            rl.close();
            return require('./init').mail();
          });
        }
      })
    },
    async sendMail() {
      console.clear();
      console.log(chalk.bold.yellow('Welcome to the ' + chalk.bold.magenta('Mail Sender')));
      let rl = require('readline').createInterface({
        input: stdin,
        output: stdout
      });
      let title = "";
      let reciever = "";
      rl.question(chalk.bold.magenta('>> ') + chalk.bold.yellow('Title ') + ': ', res => { title = res
        if (title.length < 1) {
          console.log(chalk.bold.red('Title too short!'));
          rl.close();
          return require('./init').sendMail();
        } else {
          console.log(chalk.bold.green('\u001b[A\r' + chalk.bold.magenta('>> ') + 'Title : ') + title);
          recieverinput();
        }
      });
      function recieverinput() {
        rl.question(chalk.bold.magenta('>> ') + chalk.bold.yellow('Reciever (uid): '), async res => {
          console.log(chalk.bold.yellow('Checking user...'))
          if (await (await worker.user.userExists(res)).response) {
            console.log(chalk.bold.green('\u001b[A\rUser Found!            '));
            reciever = res;
            getcontent();
          } else {
            console.log(chalk.bold.red('\u001b[A\r' + _lang.ERR_UNX));
            sleep(1000);
            rl.close();
            return recieverinput();
          }
        })
      }
      function getcontent() {
        console.log(chalk.bold.magenta('>> ') + chalk.bold.yellow('Enter Mail ($finish to finish):\n'));
        message();
        let ContentResource = [];
        function message() {
          rl.question(chalk.bold.magenta('>> '), async res => {
            if (res == '$finish') {
              console.clear();
              console.log(chalk.bold.magenta(' * ') + chalk.bold.yellow('Reciever: ') + chalk.bold.green(reciever))
              console.log(chalk.bold.magenta(' * ') + chalk.bold.green(title));
              console.log(
                ContentResource.map(res => `${chalk.bold.magenta('>>')} ${res}`).join('\n')
              )
              rl.question(chalk.bold.green('\nSend it? (y/n): '), async (yn) => {
                rl.close();
                if (yn == 'y' || yn == '\r') {
                  console.log(chalk.bold.yellow('Processing mail...'));
                  let mail = {
                    authorid: await (await worker.user.getUserName(db.get('user.id'))).response.uname,
                    title: title,
                    uid: reciever,
                    content: ContentResource.map(res => `${res}`).join('\n')
                  }
                  console.log(chalk.bold.yellow('Sending (this may take up to 5 seconds)...'));
                  ; await worker.user.sendMail(mail.uid, mail.title, mail.authorid, mail.content) ;
                  console.log(chalk.bold.green('\u001b[A\rSuccessful! Your mail has been sent to ' + chalk.bold.magenta(await (await worker.user.getUserName(mail.uid)).response.uname) + '.'))
                  console.log(chalk.bold.dim('-- continuing in 7 seconds --'));
                  sleep(7000);
                  return require('./init').mail();
                } else {
                  console.log(chalk.bold.red('Okay then.'))
                  console.log(chalk.bold.yellow('Saving draft...'));
                  if (!fs.existsSync('./drafts')) fs.mkdirSync('./drafts');
                  let timeNow = Date.now()
                  fs.writeFileSync('./drafts/draft-' + timeNow + '.txt');
                  sleep(1000);
                  console.log(chalk.bold.yellow('Done. Draft Saved to: ' + chalk.bold.magenta('./drafts/draft-' + timeNow + '.txt')));
                  console.log(chalk.bold.dim('-- continuing in 7 seconds --'));
                  sleep(7000)
                  return require('./init').mail();
                }
              })
              return;
            }
            try {
            console.log('\u001b[A\r' + chalk.bold.green('>> ') + chalk.bold.underline.white(res));
            ContentResource.push(res);
            message();
            } catch {
              console.log(chalk.bold.red('An unknown internal error occured.'))
              process.exit(0);
            }
          });
        }
      }
    },
    showUserProfile() {
      let func = require('../func/profile');
      func.run([]);
      process.exit(0);
    },
    showHelp() {
      let func = require('../func/help');
      func.run([]);
      process.exit(0);
    }
}
