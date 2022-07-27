const { stdin, stdout} = require('process');
const sound = require("sound-play");
const 
    chalk  = require('chalk'),
    worker = require('./worker.js'),
    wiodb = require('wio.db'),
    fs = require('fs'),
    db = new wiodb.JsonDatabase({databasePath: './db.json'});
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
const uid = function(length){
  return Date.now().toString(36) + Math.random().toString(36).substring(-length);
}
let currentErrors = 0;
let errorCounter = 0;
process.on('uncaughtException', err => {
  console.log(chalk.bold.red(`${upk}${upk}<package loss @ server: reestablishing connections>\n<${err.message}>`));
  errorCounter++;
  setTimeout(() => {
    if (errorCounter != currentErrors && errorCounter > 200) {
      console.log(chalk.bold.red('detected an error loop: fatalstopping JSM...'))
      process.exit(0);
    } 
    currentErrors = errorCounter;
    console.log(chalk.bold.green(`${upk}${upk}<connection reestablished>`));
  }, 1000)
})

process.on('beforeExit', async() => {
  process.stdout.write('\n' + chalk.bold.yellow('Quiting JSM...'));
  if (!db.has('user')) {
    console.log(chalk.bold.red('Quit JSM without creating an account.'));
    process.exit(0);
  }
  await worker.user.logoutAsUser(db.get('user.id')).then(i => {
    console.log(chalk.bold.red('\rQuit JSM.     '))
    process.exit(0);
  })
})
module.exports = {
    async start(args = []) {
      if (db.has('user')) {
        console.log('logging in...')
        if (await (await worker.user.getUserData(db.get('user.id'), 'online')).response) {
          console.log(chalk.bold.red('You\'re already logged in from another location.'));
          console.log(chalk.bold.red('This may cause problems with correctly displaying online status to other users.'))
          console.log(chalk.bold.red('Are you sure you would like to continue?'));
          const rlf = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          })
          
          rlf.question(' (y/n):', result => {
            if (result == 'y') { rlf.close(); this.continue(args) }
            else {
              rlf.close();
              console.log(chalk.bold.red('-- quit:alreadyloggedin --'));
              process.exit(0);
            }
          })
        } else this.continue(args);
      } else {
        console.log('creating account...');
        sleep(1000);
        this.continue(args);
      }
    },
	async continue(/** @desc I will be useful one day.*/ args = []) {
      const frnsm = this.friendmenu;
      const chnlcr = this.channelCreation;
        console.clear();
        console.log(chalk.bold.yellow('JSM '+chalk.magenta(require('../package.json').version)+ chalk.blue('<standalone>')) + ' : ' + chalk.bold.magenta('welcome back!'));
        if (!db.has('user')) {
          
          db.set('user.id',  uid(14)); //create a unique id for the current user if the user is not registered.
          var rl = require('readline').createInterface(
            {
              input: stdin,
              output: stdout
            }
          );
          rl.question(`${chalk.bold.blue('👤 Enter your username (registry) ')}${chalk.bold.magenta(': ')}`, regname => {
            if (regname.length < 3) {
              console.log(chalk.bold.red('Username too short! a username longer than 3 characters is required.'));
              sleep(3000);
              return this.start();
            }
            db.set('user.name', regname);
            console.log(chalk.bold.yellow('This is your first time logging in! You have been registered to the database.'));
            console.log(chalk.bold.yellow('Your UUID is ' + chalk.bold.magenta(db.get('user.id')) + '.'));
            console.log(chalk.bold.yellow('Share this code with people to allow them to add you as friends.'));
            console.log(chalk.bold.yellow('To add someone as friends, enter '+chalk.bold.bgGray.yellow('$friendmenu')+' to the name input field.'));
            sleep(1000);
            worker.user.registerUser(db.get('user.name'), db.get('user.id'));
            worker.user.loginAsUser(db.get('user.id'));
            rl.close();
            console.log(chalk.bold.green('Please restart JSM to continue.'));
            process.exit(0);
          })
        } else { idfk() };
        async function idfk() {
        worker.user.loginAsUser(db.get('user.id'));
        console.log(chalk.bold.redBright('To continue, please enter your session-name and proceed with joining a channel or execute a command.\nhelp for a list of commands.'));
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          var username = 'user' + Math.random().toString().substring(7); //generate a unique identifier for the user if it is not set
            readline.question(chalk.bold.blue('👤 Option (press enter for channel creation)') + chalk.bold.magenta(':') + chalk.bold.green(' '), name => {
              if (name.length < 1) name = db.get('user.name');
              process.stdout.write('\u001b[A\r' + chalk.bold.green('👤 Option (press enter for channel creation)') + chalk.bold.magenta(':') + chalk.bold.green(' ' + name));
              
              if (name == 'friends') {
                readline.close();
                frnsm();
                return;
              }
              if (name == 'mail') {
                readline.close();
                return require('./init').mail();
              };
              if (name == 'help') {
                readline.close();
                console.log(chalk.bold.yellow('\nfriends') + ' : ' + chalk.bold.green('shows the friends menu.'));
                console.log(chalk.bold.yellow('quit') + '       : ' + chalk.bold.green('quits the application.'));
                console.log(chalk.bold.yellow('mail') + '       : ' + chalk.bold.green('shows the mail menu.'));
                console.log(chalk.bold.yellow('-- continuing in 10 seconds --'))
                sleep(10000);
                return require('./init').continue();
              }
              if (name == 'quit') {
                worker.user.logoutAsUser(db.get('user.id'));
                console.log('quit JSM');
                process.exit(0);
              }
              username = name;
              readline.close();
              var first = true
              var second = false
              var result = 'first';
              var chc = chnlcr;
              function thisAgain() {
                console.clear();
                console.log(
                    chalk.bold.yellow('\tSelect a chat mode (scroll with the <- or -> key, confirm with the enter key or go back with the backspace key):'),
                    chalk.magenta(`\n\t\t\t\t\t${first ? chalk.underline.bold.dim('New Channel') : chalk.bold.whiteBright('New Channel')} ${second ? chalk.underline.bold.dim('Find Channel') : chalk.bold.white('Find Channel')}`)
                )
                try {
                  process.stdin.setRawMode(true);
                } catch {
                  console.clear();
                  console.log(chalk.bold.red('sorry, your terminal does not support JSM.'));
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
                    console.log(chalk.bold.red('Since v1.5.0 keystrokes y and b are depreciated.\nPlease use backspace and enter instead.'))
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
        if (type == 'nc') {
            let channel_name = 'channel_' + Math.random().toString().substring(7);
            let channel_id = '#' + Math.random().toString().substring(13);
            const readlinef = require('readline').createInterface({
            input:    process.stdin,
            output:    process.stdout
            })
            readlinef.question(chalk.bold.magenta('>>') + chalk.bold.blue(' Enter Channel Name (press enter for a random name)') + chalk.bold.magenta(': '), async name => {
                process.stdout.write('\u001b[A\r' + ' '.repeat(process.stdout.columns + 1));
                if (name.length < 1);
                else channel_name = name;
                readlinef.close();
                process.stdout.write(chalk.bold.yellow('Creating channel...'))
                let channelCreationInstance = await worker.createChannel(channel_name, channel_id);
                if (channelCreationInstance === 405) return console.log(chalk.bold.red('\rA channel by the identifier ' + channel_id + ' already exists! Auto-id Failed. Please re-create a channel.'))
                console.log(chalk.bold.green('\rChannel created.        '))
                console.log(chalk.bold.yellow('>> Channel ID   :') + chalk.bold.magenta(channel_id))
                console.log(chalk.bold.yellow('>> Channel Name : ') + chalk.bold.magenta(channel_name)) 
                console.log(chalk.bold.green('joining room '+chalk.bold.magenta(channel_id)+'...'))
                let messageCollectionInstance = await worker.getMessages(channel_id);
                console.clear();
                console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                let chat_current = messageCollectionInstance;
                let _input = '';
                process.stdin.setEncoding('ascii');
                process.stdin.setRawMode(true);
                let closed = false;
                await worker.sendMessage(channel_id, `${chalk.bold.magenta('>>')} ${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)} joined the chat room.`)
                console.clear(); 
                console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                console.log(chat_current.response.content);
                process.stdin.setEncoding('utf-8')
                process.stdin.setRawMode(true);
                process.stdin.on('data', async (buf) => {
                    const charAsAscii = buf.toString().charCodeAt(0);
                
                    switch (charAsAscii) {
                        case 0x03:
                            console.log(chalk.bold.red('\nDepreciated command (ctrl+c): use ctrl+l to quit JSM.'));
                            break;
                
                        case 0x04:
                            break;
                
                        case 0x0c:
                            console.log(chalk.bold.red('\nLeaving the chat room...'))
                            console.log('\n', chalk.bold.red('-- LEAVING --'));
                            await worker.sendMessage(channel_id, chalk.bold.magenta('>> ') + chalk.bold.yellow(username) + chalk.bold.red(' left the chat room.'));
                            console.log('\u001b[A\r', chalk.bold.red('-- LOGGING OUT --'));
                            await worker.user.logoutAsUser(db.get('user.id'));
                            process.exit(0);
                            break;
                
                        case 0x0d:
                            process.stdin.emit('line', process.stdin.currentLine);
                            process.stdin.currentLine = '';
                            break;
                
                        default:
                            process.stdin.currentLine += String.fromCharCode(charAsAscii);
                            break;
                    }
                }); // ctrl+l for Leave update [added 1.4.2]
                /**
                 * @since 1.4.2
                 */
                let chat_new = await worker.getMessages(channel_id);
                let setter = false;
                let getCharData = true;
                process.stdin.on('data', function(input) {
                  if (!getCharData) return;
                  _input = _input + input;
                  _input = _input.replace('\r', '');
                });
                let ispaused = false;
                let lastReadline = null;
                const interval = setInterval(async () => {
                  chat_new = await worker.getMessages(channel_id)
                  if (!setter || chat_current.response.content != chat_new.response.content) {

                    if (lastReadline != null) { lastReadline.close() };
                    setter = true;
                    process.stdin.setEncoding('utf-8');
                    chat_current = chat_new;
                    console.clear(); 
                    console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                    console.log(chat_current.response.content);
                    if (!process.argv.includes('--disable-notifications')) sound.play(__dirname + '/notification.mp3', 70); // notification sounds for notification update [added 1.5.1]
                    var readline = require('readline').createInterface({
                      input: process.stdin,
                      output: process.stdout
                    })
                    if (_input.length > 0) {
                      ispaused = true;
                      getCharData = false;
                      readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: ${_input}`, async data => {
                        
                        const ff = _input + data;
                        console.log(`${chalk.bold.yellow('sending message...')}`)
                        console.clear(); 
                        console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                         console.log(chat_current.response.content + '\n' + `${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}\n${chalk.bold.red('-- COOLDOWN --')}`);
                        await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}`);
                        _input = '';
                        ispaused = false;
                        getCharData = true;
                        readline.close();
                        return;
                      })
                    }
                    if (!ispaused) readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: `, async data => {
                      console.log(chalk.bold.red(_input))
                      _input = ''; //reset current input
                      if (data.includes('$leave')) return console.log(chalk.bold.red('command depreciated. use ctrl+l instead.'));
                      if (data.startsWith('admin:')) {
                        const command = data.split(':').split(' ')[0];
                        console.log(chalk.bold.yellow(`${command} : executing...`))
                        if (data == 'admin:clc JSM_NEHIR') {
                          console.log(chalk.bold.yellow(`${command} : clearing chat... [administrator.clearChat]`));
                          await worker.sendMessage(channel_id, 'SlNNX05FSElSXw==');
                          console.log(chalk.bold.green('Success: channel nuked.'));
                          sleep(2000);
                          return;
                        }
                      }
                      if (data.startsWith('admin:')) {
                        const command = data.split(':').split(' ')[0];
                        console.log(chalk.bold.yellow(`${command} : executing...`))
                        if (data == 'admin:clc JSM_NEHIR') {
                          console.log(chalk.bold.yellow(`${command} : clearing chat... [administrator.clearChat]`));
                          await worker.sendMessage(channel_id, 'SlNNX05FSElSXw==');
                          console.log(chalk.bold.green('Success: channel nuked.'));
                          sleep(2000);
                          return;
                        }
                      }
                      console.log(`${chalk.bold.yellow('sending message...')}`)
                      console.clear(); 
                      console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                      console.log(chat_current.response.content + '\n' + `${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}\n${chalk.bold.red('-- COOLDOWN --')}`);
                      await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}`);
                      setter = false;
                      readline.close();
                    })
                    return;
                  }
                }, 1000);
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
            console.log(chalk.bold.yellow('Connecting to ' + chalk.bold.magenta(key) + '...'));
            try {
              let data = await worker.getMessages(key.replace('#', ''));
            } catch {
              return console.log(chalk.bold.red('\u001b[A\rNo such channel exists with the id ' + chalk.bold.magenta(key) + '.'));
            }
            
            let data = await worker.getMessages(key.replace('#', ''));
            if (data.status === 404) {
              return console.log(chalk.bold.red('\u001b[A\rNo such channel exists with the id ' + chalk.bold.magenta(key) + '.'));
            }
            
            process.stdout.write('\u001b[A\r' + ' '.repeat(process.stdout.columns + 1));
                if (key.length < 1);
                readlinef.close();
                let channel_id = key;
                
                let messageCollectionInstance = await worker.getMessages(key.replace('#', ''))
                console.log('here')
                let chat_current = messageCollectionInstance;
                let _input = '';
                process.stdout.write(chalk.bold.yellow('Joining room ' + chalk.bold.magenta(key) + '...'))
                console.clear();
                console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'GUEST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                process.stdin.setEncoding('ascii');
                process.stdin.setRawMode(true);
                let getCharData = true;
                process.stdin.on('data', function(input) {
                  if (!getCharData) return;
                  _input = _input + input;
                  _input = _input.replace('\r', '');
                });
                await worker.sendMessage(channel_id, `${chalk.bold.magenta('>>')} ${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)} joined the chat room.`)
                console.clear(); 
                console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'GUEST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                console.log(chat_current.response.content);
                process.stdin.setEncoding('utf-8');
                process.stdin.setRawMode(true);
                process.stdin.on('data', async (buf) => {
                    const charAsAscii = buf.toString().charCodeAt(0);
                
                    switch (charAsAscii) {
                        case 0x03:
                            process.kill(process.pid, 'SIGINT');
                            break;
                
                        case 0x04:
                            break;
                
                        case 0x0c:
                            console.log(chalk.bold.red('\nLeaving the chat room...'))
                            console.log('\n', chalk.bold.red('-- LEAVING --'));
                            await worker.sendMessage(channel_id, chalk.bold.magenta('>> ') + chalk.bold.yellow(username) + chalk.bold.red(' left the chat room.'));
                            console.log('\u001b[A\r', chalk.bold.red('-- LOGGING OUT --'));
                            await worker.user.logoutAsUser(db.get('user.id'));
                            process.exit(0);
                
                        case 0x0d:
                            process.stdin.emit('line', process.stdin.currentLine);
                            process.stdin.currentLine = '';
                            break;
                
                        default:
                            process.stdin.currentLine += String.fromCharCode(charAsAscii);
                            break;
                    }
                });
                let chat_new = chat_current;
                let setter = false;
                let ispaused = false;
                let lastReadline = null;
                setInterval(async () => {
                  chat_new = await worker.getMessages(channel_id)
                  if (!setter || chat_current.response.content != chat_new.response.content) {
                    if (lastReadline != null) { lastReadline.close() };
                    setter = true;
                    chat_current = chat_new;
                    console.clear(); 
                    process.stdin.setEncoding('utf-8');
                    console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'GUEST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                    console.log(chat_current.response.content);
                    if (!process.argv.includes('--disable-notifications')) sound.play(__dirname + '/notification.mp3', 70);
                    var readline = require('readline').createInterface({
                      input: process.stdin,
                      output: process.stdout
                    })
                    lastReadline = readline;
                    if (_input.length > 0) {
                      ispaused = true;
                      getCharData = false;
                      readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: ${_input}`, async data => {
                        const ff = _input + data;
                        console.log(`${chalk.bold.yellow('sending message...')}`)
                        console.clear(); 
                        console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                        console.log(chat_current.response.content + '\n' + `${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}\n${chalk.bold.red('-- COOLDOWN --')}`);
                        await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}`);
                        _input = '';
                        ispaused = false;
                        getCharData = true;
                        readline.close();
                        return;
                      })
                    } // other message collector [a message was sent while the client was typing]
                    if (!ispaused) readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: ${_input.replace('\r', '')}`, async data => {
                      _input = ''; //reset current input
                      if (data.startsWith('$leave')) return console.log(chalk.bold.red('command depreciated. use ctrl+l instead.'));
                      console.log(`${chalk.bold.yellow('sending message...')}`)
                      console.clear(); 
                      console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+username == 'Nehir' ? chalk.bold.redBright('ADMIN') : 'HOST'+']')}  ${chalk.bold.green(`[149ms]`)}`));
                      console.log(chat_current.response.content + `${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}\n${chalk.bold.red('-- COOLDOWN --')}`);
                      await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}`);
                      setter = false;
                      readline.close();
                    });
                    return;
                  }
                }, 1000);
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
      console.log('loading user friends...');
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
          const friend = friends[i];
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
            console.log(chalk.bold.red('This user is already your friend.'))
            sleep(2000);
            rl.close();
            return require('./init').friendmenu();
          }
          console.log('found user ['+await (await worker.user.getUserName(uuid)).response.uname+']');
          await worker.user.addFriend(user.id, uuid);
          console.log(chalk.bold.green('\rThis user has been added to your friend list! ' + chalk.bold.magenta(await (await worker.user.getUserName(uuid)).response.uname) + ' is now your friend.'))
          sleep(2000);
          rl.close();
          return require('./init').friendmenu();
        } else {
          console.log(chalk.bold.red('\rThis user does not exist!'));
          sleep(2000);
          rl.close();
          require('./init').friendmenu();
          return;
        }
      })
    },
    async mail() {
      console.log('\ndownloading mail keychain...');
      let mail = await (await worker.user.getUserMail(db.get('user.id'))).response;
      console.clear();
      console.log(chalk.bold.yellow('Welcome to the ' + chalk.bold.magenta('Mail Menu') + '.'));
      console.log(chalk.bold.yellow('Here you can view the mails you have in your inbox, or send one to another user.'));
      console.log(chalk.bold.blue('Mail ('+mail.length+'): '))
      for (let i = 0; i < mail.length; i++) {
        const mailcurrent = mail[i];
        let when = mailcurrent.time;
        if (!when) when = chalk.bold.underline('unknown date')
        console.log(chalk.bold.magenta('['+(i+1)+']'), chalk.bold.yellow(mailcurrent.author + ':'), chalk.bold.green(mailcurrent.title), ' @ ', chalk.bold.underline(when));
      }
      const rl = require('readline').createInterface({
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
      const rl = require('readline').createInterface({
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
            console.log(chalk.bold.red('\u001b[A\rUser does not exist!'));
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
                  const mail = {
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
                  const timeNow = Date.now()
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
    }
}
