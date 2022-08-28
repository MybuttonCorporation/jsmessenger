let wdb = require('wio.db'), db = new wdb.JsonDatabase({databasePath: './db.json'}), chalk = require('chalk'), fs = require('fs');
let sound = require("sound-play");
let language = `./lang/${db.has('cli_lang') ? db.get('cli_lang') : 'english'}.json`
let _lang = require(language);
let helper = require('./helper');
let worker = require('./worker');
let showChannel = async function(channel_id = '#jsm', username = 'Anonymous', jt = 'nc') {
    await worker.sendMessage(channel_id, `${chalk.bold.magenta('>>')} ${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)} joined the chat room.`);
    let messageCollectionInstance = await worker.getMessages(channel_id.replace('#', ''))
    let __f = require('./util/MessageCollector');
    let checker = new __f();
    checker.__messages.FromString(messageCollectionInstance.response?.content);
    let chat_current = messageCollectionInstance;
    let _input = '';
    console.clear();
    process.stdin.setEncoding('ascii');
    process.stdin.setRawMode(true);
    let getCharData = true;
    process.stdin.on('data', function(input) {
      if (!getCharData) return;
      _input = _input + input;
      _input = _input.replace('\r', '');
    });
          console.clear(); 
          let $jointype = jt == 'nc' ? 'HOST' : 'GUEST';
          if (db.get('user.name') == '@Nehir') $jointype = chalk.bold.red('ADMIN')
          console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('[' + $jointype + ']')}  ${chalk.bold.green(`[149ms]`)}`));
          console.log(chat_current.response.content);
          process.stdin.setEncoding('utf-8');
          process.stdin.setRawMode(true);
          process.stdin.on('data', async (buf) => {
             let charAsAscii = buf.toString().charCodeAt(0);
          
              switch (charAsAscii) {
                  case 0x03:
                      process.kill(process.pid, 'SIGINT');
                      break;
          
                  case 0x04:
                      break;
          
                  case 0x0c:
                      console.log(chalk.bold.red('\n' + _lang.strings.menu.ch.leave))
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
          let NewContent = new __f();
          NewContent.__messages.FromString(chat_new.response?.content);
          let CurContent = new __f();
          CurContent.__messages.FromString(chat_current.response?.content);
          let loadInterval = setInterval(async () => {
            chat_new = await worker.getMessages(channel_id);
            NewContent.__messages.FromString(chat_new.response?.content);
            if (chat_new.response.remoteContent != undefined) {
              let data = chat_new.response.remoteContent;
              let { message, type } = data;
              if (type == 'ERR') {
                await worker.logging.PrintRemoteErrorMessage('\n'+message+upk);
              }
              else if (type == 'SUC') {
                await worker.logging.PrintRemoteSuccessMessage('\n'+message+upk);
              }
              else {
                await worker.logging.PrintRemoteInfoMessage('\n'+message+upk);
              }
            }

            if (!setter || chat_new.response.content != CurContent.GetData('\n').format('joined')) {
              if (lastReadline != null) { lastReadline.close() };
               setter = true;
              chat_current = chat_new;
              CurContent.__messages.__DATA = NewContent.__messages.__DATA
              if (chat_current.response.content.endsWith(`user ${username} has been kicked by ${chalk.bold.red('[remote:admin]')}.\n`)) {
                let log = msg => console.log(`\n${chalk.bold.yellow('['+chalk.bold.red('remote')+']')} ${msg}`);
                log(`you have been kicked from ${chalk.bold.magenta(`${channel_id}`)}.`);
                await worker.sendMessage(channel_id, `${chalk.bold.magenta('>>')} ${chalk.bold.yellow('&time')} ${chalk.bold.magenta(username)} ${chalk.bold.red('has been kicked from the room.')}`);
                await worker.user.logoutAsUser(db.get('user.id'));
                return process.exit(0);
              }
              if (chat_current.response.content.endsWith('for a client-sided update.\n')) {
                clearInterval(loadInterval);
                console.log(`${chalk.bold.red('\nLOCAL-SYSTEM-MESSAGE ')}${chalk.bold.dim('Your client is going to restart due to an auto update.')}`)
                sleep(2000);
                console.log(`${chalk.bold.yellow('Updating JSM...')}`);
                let { exec } = require('child_process')
                let updateCommand = await exec(`npm install jsmesseger`);
                let d = 0;
                updateCommand.stdout.on('data', str => {
                  process.stdout.write(chalk.bold.yellow('\rupdating... [' + '='.repeat(d) + ']'));
                  d++;
                })
                updateCommand.on('close', () => {
                  console.log('\r' + ' '.repeat(process.stdout.columns));
                  sleep(1000);
                  console.log(chalk.bold.green('Update successful.'));
                  sleep(1000);
                  console.log(chalk.bold.yellow('quitting...'));
                  sleep(1000);
                  worker.user.logoutAsUser(db.get('user.id'));
                  console.log(chalk.bold.red('Kicked: CLIENT_UPDATE'));
                  process.exit(0);  
                  return;
                })
              }
              if (chat_current.response.content.endsWith('for a server-sided update.\n')) {
                console.log(chalk.bold.red('\nGLOBAL-SYSTEM-MESSAGE ') + `${chalk.bold.white(`The server is going to restart in 5 seconds.`)}`)
                sleep(3000)
                setTimeout(async () => {
                  console.log(chalk.bold.red('\nLOCAL-SYSTEM-MESSAGE ') + `${chalk.bold.white('Server rebooting...')}`);
                  await worker.user.logoutAsUser(db.get('user.id'));
                  console.log(chalk.bold.red('Kicked from the server: SERVER_RESTART'));
                  process.exit(0);
                }, 5000);
              }
              console.clear(); 
              process.stdin.setEncoding('utf-8');
              let $jointype = jt == 'nc' ? 'HOST' : 'GUEST';
              if (db.get('user.name') == '@Nehir') $jointype = chalk.bold.redBright('ADMIN');
              console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+ $jointype +']')}  ${chalk.bold.green(`[149ms]`)}`));
              console.log(chat_current.response.content);
              if (!process.argv.includes('--disable-notifications')) sound.play(__dirname + '/notification.mp3', 70);
              var readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
              })
              lastReadline = readline;
              if (_input.length > 0) {
                ispaused = true;
                getCharData = true;
                readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: `, async data => {
                  let ff = data;
                  console.log(`${chalk.bold.yellow(_lang.strings.messages.FC_AWAIT_SEND_MESSAGE)}`)
                  if (username.includes('@')) ff = chalk.bold.cyan(ff);
                  if (username.includes('%')) ff = chalk.bold.yellow(ff);
                  console.clear(); 
                  let $jointype = 'GUEST';
                  console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+ $jointype +']')}  ${chalk.bold.green(`[149ms]`)}`));
                  if (db.get('user.name') == '@Nehir') $jointype = chalk.bold.redBright('ADMIN');
                  console.log(chat_current.response.content + '\n' + `${chalk.bold.dim('>>')} ${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}\n${chalk.bold.red('-- COOLDOWN --')}`);
                  await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(ff)}`);
                  _input = '';
                  ispaused = false;
                  getCharData = true;
                  readline.close();
                  return;
                })
                readline.write(_input)
              } // other message collector [a message was sent while the client was typing]
              if (!ispaused) readline.question(`${chalk.bold.magenta(channel_id)} ${chalk.bold.yellow(username)}: ${_input.replace('\r', '')}`, async data => {
                _input = ''; //reset current input
                if (data.length < 1) return (setter = false & console.log(chalk.bold.red('Cannot send empty message.')) & readline.close());
                if (data.startsWith('$leave')) return console.log(chalk.bold.red('command depreciated. use ctrl+l instead.'));
                if (username.includes('@')) data = chalk.yellow(data);
                if (username.includes('%')) data = chalk.blue(data);
                
                console.clear(); 
                console.log(chalk.bold.magenta(`[${channel_id}]  ${chalk.bold.yellow('['+$jointype+']')}  ${chalk.bold.green(`[149ms]`)}`));
                console.log(chat_current.response.content + `${chalk.bold.dim('>>')} ${chalk.bold.yellow('['+`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`+']')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}\n${chalk.bold.yellow('-- SENDING --')}`);
                process.stdout.write(`${chalk.bold.magenta(channel_id + ' ')}${chalk.bold.yellow(username)}: `);
                await worker.sendMessage(channel_id, `${chalk.bold.yellow('[&time]')} ${chalk.bold.magenta(username)}: ${chalk.bold.white(data)}`);
                setter = false;
                readline.close();
              });
              return;
            }
          }, 1000);
  };
module.exports = showChannel;