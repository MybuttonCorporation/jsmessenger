#!/usr/bin/env node
'use strict';
const { existsSync } = require('fs');
const { aggregateKeyboardLayout } = require('node-key-sender');
function start(args = []) {
    let db = new (require('wio.db')).JsonDatabase({databasePath: './jsmdb.json'}), chalk = require('chalk')
    if (db.has('devtools_allowed') && db.get('devtools_allowed') && args.includes('--devtools:channelviewer')) {
        console.log(chalk.bold.yellow('Please wait, loading devtools GUI...'))
        const { app, BrowserWindow } = require('electron');
        app.whenReady().then(async function() {
            const window = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true
                },
                center: true,
                icon: __dirname +'/app/jsm.png',
                title: 'JSMessenger devtools:channelview GUI',
                darkTheme: true,
                closable: true,
                hasShadow: true,
                titleBarOverlay: true,
                titleBarStyle: 'hidden',
                tabbingIdentifier: 'JSMessenger',
                movable: true,
                parent: 'JSMessenger',
                fullscreen: true
            });
            window.loadURL(`https://jsmsgserver.nehirkedi.repl.co/devtools:channelviewer`);
        })
        app.on('before-quit', data => {
            console.log(chalk.bold.yellow('Quit JSM Premium.'));
        })
        return;
    }
    var language = {
        value: db.has('cli_lang') ? db.get('cli_lang') : 'english',
        isSet: db.has('cli_lang'),
        setup() {
            console.log(chalk.bold.yellow('Select your preferred client language:'))
            let languages = ["english", "turkish", "french", "german", "italian"]
            let i = 0;
            languages.forEach(lang => {
                i++;
                console.log(chalk.magenta('>'), chalk.bold.yellow(i + ':'), chalk.underline.bold.red(lang));
            });
            let rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
            rl.question(`${chalk.bold.underline.yellow('Select a language [1-'+languages.length+']: ')}`, response => {
                let responseInNumber = parseInt(response);
                if (isNaN(responseInNumber)) {
                    rl.close();
                    console.log(chalk.bold.red('The response is not a valid number.'));
                    setTimeout(() => {
                        console.clear();
                        this.setup();
                    }, 3000);
                    return;
                }
                if (responseInNumber > languages.length) {
                    rl.close();
                    console.log(chalk.bold.red('The response is not in bound of the language list.'));
                    setTimeout(() => {
                        console.clear();
                        this.setup();
                    }, 3000);
                    return;
                }
                console.log(chalk.bold.green('client language set to: ' + languages[responseInNumber-1]));
                this.set(languages[responseInNumber-1]);
                rl.close();
                require('./app/init.js').start(args);
                
            })
        },
        set(language = "") {
            db.set('cli_lang', language);
        }
    }    
    const fs = require('fs');
    const util = require('./util/base');
    if (language.isSet && fs.existsSync(process.cwd() + '/lmfdb.json')) {
        if (fs.existsSync(process.cwd() + '/db.json')) {
            let f = require(process.cwd() + '/db.json');
            if (f?.user && f?.user?.id && f?.cli_lang && f?.user?.name) {
              function sleep(ms = 0) {
               var start = new Date().getTime();
               while (new Date().getTime() < start + ms);
              }
              util.util.log('JSM', 'a user database, possibly created automatically by JSM, was detected.');
              util.util.log('JSM', 'File Name: '+process.cwd()+'\\db.json');
              util.util.log('JSM', 'Would you like to move this database to your current one?');
              util.util.log('JSM', 'This is caused by an update to the JSM database name.');
              let rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
              rl.question(chalk.red('Move database? (y/n): '), data => {
                if (data == '' || data == 'y') {
                  util.util.log('JSM', 'Moving database...');
                  sleep(1000);
                  util.util.log('JSM', 'Found user: ' + chalk.bold.underline.magenta(f?.user?.name));
                  util.util.log('JSM', 'Running Task: JSM::Database::Move with Args: ["./db.json"]');
                  let data = fs.readFileSync(process.cwd() + '/db.json', 'utf-8');
                  fs.writeFileSync(process.cwd() + '/jsmdb.json', data);
                  sleep(100);
                  fs.unlinkSync(process.cwd() + '/db.json');
                  util.util.log('JSM', 'Task complete.');
                  util.util.log('JSM', 'Moved:\n\t\t' + process.cwd() + '/db.json -> '+process.cwd() + '/jsmdb.json');
                  util.util.log('JSm', chalk.bold.yellow('Please restart JSM to continue.'));
                }
              })
            }
        }
      };
    if (!language.isSet) language.setup();
    if (existsSync(__dirname + '/func/' + args[0]?.replace('--', '') + '.js')) {
        if (args[0].length < 4) return require('./util/base').util.log(args[0], 'unknown option (try jsm -'+args[0].replace('--', '')+')');
        let f = require('./func/' + args[0]?.replace('--', '') + '.js')
        f.run(args.slice(1));
        return;
    }
    else if (existsSync(__dirname + '/func/' + args[0]?.replace('-', '') + '.js')) {
        if (args[0].length < 2) return require('./util/base').util.log(args[0], 'unknown option (try jsm --'+args[0].replace('-', '')+')');
        let f = require('./func/' + args[0]?.replace('-', '') + '.js')
        f.run(args.slice(1));
        return;
    }
    else if (args[0] && !['--join', '--dev', '--disable-notifications'].includes(args[0])) {
        return require('./util/base').util.log(args[0], 'bad parameter.');
    }
    if (language.isSet) return require('./util/base.js').util.run_task('start', args);
}
start(process.argv.slice(2));
