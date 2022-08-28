const { write } = require('fs');
let worker   = require('./app/worker'),
    readline = require('readline'),
    chalk    = require('chalk');
    worker.user.registerUser('ADMINISTRATOR', 'jsm.admin');
    worker.user.loginAsUser('jsm.admin');
    worker.user.__LOCAL_USER_UNIQUE_ID = 'jsm.admin'
    let __interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    let history = [];
    process.stdin.setRawMode(true);
    process.stdin.setEncoding('utf-8');
    let selector = 0;
    let writeAfter = "";
    process.stdin.on('data', data => {
      if (data == '\b') return writeAfter = writeAfter.substring(-1);
      if (data == '\r') return writeAfter = "";
      writeAfter += data;
    })
async function __prompt() {
  //if (writeAfter != "") {
  //  __interface.write(writeAfter);
  //}
  __interface.question(chalk.bold.magenta('>> ') + chalk.bold.yellow(chalk.bold.underline('enter command')) + chalk.bold.dim(': '), async message => {
    let command = message.split(' ');
    let option = {
      'sendMessage': worker.sendMessage,
      'getMessages': worker.getMessages,
      'createChannel': worker.createChannel,
      'user.register': worker.user.registerUser,
      'user.delete': worker.user.deleteUser,
      'user.sendMail': worker.user.sendMail,
      'user.login': worker.user.loginAsUser,
      'user.logout': worker.user.logoutAsUser,
      'user.getMail': worker.user.getUserMail,
      'user.addFriend': worker.user.addFriend,
      'user.getFriends': worker.user.getUserFriends,
      'user.getData': worker.user.getUserData,
      'user.exists': worker.user.userExists,
      'user.getName': worker.user.getUserName,
      'user.getIdByName': async (name) => {
        let req = await worker.user.getId(name);
        return req;
      },
      'user.ban': async (id) => {
        let log = msg => console.log(`${chalk.bold.yellow('['+chalk.bold.red('remote')+']')} ${msg}`)
        log('Banning user...');
        let req = await worker.user.setUserData(id, 'banned', true);
        if (req.response == false) {
          log(`Banned user ${chalk.bold.magenta(id)}.`);
        }
        return req;
      },
      'user.kick': async (name, channel) => {
        let message = `${chalk.bold.yellow('['+chalk.bold.red('remote')+']')} user ${name} has been kicked by ${chalk.bold.red('[remote:admin]')}.`
        let log = msg => console.log(chalk.bold.yellow(`[${chalk.bold.red(name)}] ${msg}`))
        log(`kicking ${name} from ${channel}...`);
        worker.sendMessage(channel, message);
        log(`user kicked from ${channel}`);
        return {
          remoteContent: {
            type: 'INFO',
            message: 'user kicked from from ' + channel
          }
        }
      },
      '#logger->enable': async (cid) => {
        let log = msg => console.log(chalk.bold.yellow(`[${chalk.bold.red(cid.substring(1))}] ${msg}`))
        log(`Connecting to ${chalk.bold.magenta(cid)}...`);
        let data = await worker.getMessages(cid);
        if (data.response && data.response.remoteContent) {
          return log(`Channel does not exist.`);
        };
        log(`Now logging ${chalk.bold.magenta(cid)} messages.`);
        let messages = await worker.getMessages(cid);
        let e = 0;
        setInterval(async function() {
          if (e == 1) {
            let newMessages = await worker.getMessages(cid);
            if (newMessages.response != undefined) e = 0;
            return;
          }
          let newMessages = await worker.getMessages(cid);
          if (messages.response == undefined || newMessages.response == undefined) {
            console.log(`\n${chalk.bold.yellow('['+chalk.red(cid)+']')} ${chalk.bold.magenta('>>')} ${chalk.bold.red('Package loss [disconnected]')}`);
            e = 1;
            return;
          }
          if (messages.response.content != newMessages.response.content) {
            let new_content = newMessages.response.content.replace(messages.response.content, '');
            process.stdout.write(`\n${chalk.bold.yellow('['+chalk.red(cid)+']')} ${new_content}\r${chalk.bold.magenta('>>')} ${chalk.bold.underline.yellow('enter command')}${chalk.bold.dim(':')} `);
            messages = newMessages;
            __interface.line = "";
            __interface.write(writeAfter);
          }
        }, 1000)
        return {
          response: undefined
        }
      }
    }[command[0]]
    if (option == undefined) {
      console.log(chalk.bold.red('unknown command: ' + command));
      __prompt()
      return;
    }
    let arguments = command.slice(1).join(' ').split(' | ');
    let exec = await option(...arguments);
    if (exec == undefined && exec?.response != undefined && exec?.response.remoteContent != undefined) {
      __prompt()
      return;
    }
    console.log(exec?.status, exec?.response);
    __prompt()
  })
}
process.on('beforeExit', () => {
  console.log('\nwait quiting')
  worker.user.logoutAsUser('jsm.admin');
  process.exit(0);
})
process.on('uncaughtException', (err) => {
  console.log('\n' + err.stack)
  worker.user.logoutAsUser('jsm.admin');
})

__prompt()