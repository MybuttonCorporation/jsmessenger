module.exports = {
    name: 'Remote Connection Proxy Utility',
    usage: 'jsm --remote <server path>', 
    desc: 'Connects to the JSM Remote Proxy within the server path.', 
    example: 'jsm --remote /logs/view/9593523',
    async run(args = []) {
        let path = args[0];
        let connection_uid = `${Math.random()}`.substring(2);
        const chalk = require('chalk'), worker = require('../app/worker'), axios = require('axios');
        if (!path) return console.log(chalk.bold.red('The specified command requires SERVER-PATH argument.'));
        if (!path.startsWith('/')) return console.log(chalk.bold.red('Invalid path. A path starts with \'/\''))
        axios.get("https://jsmsgserver.nehirkedi.repl.co" + path).then(async response => {
            console.log(chalk.bold.yellow('Connecting to ' + chalk.bold.bgRgb(46, 46, 46).magenta(path)));
            let readline = require('readline').createInterface({input: process.stdin, output: process.stdout});
            let proxy = await worker.createProxy(connection_uid);
            process.on('beforeExit', s=> {
                proxy.destroy();
                process.exit(0);
            })
            let newreadline = require('readline').createInterface({input: process.stdin, output: process.stdout});
            proxy.listener.on('question', function(data) {
                if (data.res == 'password_authentication') {
                        readline.close();
                        newreadline.close();
                        newreadline = require('readline').createInterface({input: process.stdin, output: process.stdout});
                        if (proxy.connection.authentication) console.log(chalk.bold.red('\nServer restarted, password authentication is required.'))
                        newreadline.question(data.title, async function (response) {
                        let returned = await proxy.authenticate(response);
                        if (returned) console.log(chalk.bold.green('Proxy authorized'))
                        else {console.log(chalk.bold.red('proxy authentication failed')); process.exit(1);}
                        proxy.connection.authentication = returned;
                        newreadline.close();
                        return runconsole();
                    })
                }
            }) 
            async function runconsole() {
                readline = require('readline').createInterface({input: process.stdin, output: process.stdout});
                let authenticated = proxy.connection.authentication;
                if (authenticated) {
                    readline.question(chalk.bold.magenta(`>> ${chalk.bold.yellow('Enter command: ')}`), async cmd => {
                        let returns = await proxy.send(cmd);
                        if (!returns.PROXY_CONNECTION) console.log(returns.response);
                        readline.close();
                        runconsole();
                    })
                }
            }
            console.log(chalk.bold.yellow('A Socket has been created at ' + chalk.bold.bgRgb(46, 46, 46).magenta(path)));
        }).catch(e => {
            if (args.includes('--dev')) console.log(e);
            console.log(chalk.bold.red('The Remote does not have a proxy in ' + path));
            process.exit(1);
        })
    }
}