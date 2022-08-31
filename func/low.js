module.exports = {
    desc: 'Executes an operation locally, without connecting to jsm\'s servers.',
    usage: 'jsm --low <operation> [params]',
    example: 'jsm --low exec jsm.util.run_task(\'start\');',
    name: 'Local Operation Worker',
    async run(args = []) {
        const chalk = require('chalk');
        const util = require('../util/base');
        let data = this;
        let findOperation = {
            'help': {example: 'jsm --low help exec', name: 'Help', usage: 'jsm --low help [command]', desc: 'provides information about a command.', i: async function(args = []) {
                if (findOperation[args[0]] != undefined) {
                    let data2 = findOperation[args[0]];
                    console.log(util.describe(data2));
                    return;
                }
                util.util.log('Help', ('\'' +args[0]+'\'' ?? undefined) + ' is not a valid operation.');
                util.util.log('Help', 'See ' + chalk.bold.underline.bgBlack.white('jsm --low help "low"') + ' for further information.')
            }},
            'low': {example: 'jsm --low exec jsm.util.run_task("start")', desc: 'Executes an operation locally, without connecting to jsm\'s servers.', name: 'Local Operation Worker', usage: 'jsm --low <operation> [params]'},
            'exec': {example: 'jsm --low exec jsm.util.run_task("start");', name: 'Command Evaluator', usage: 'jsm --low exec <statement>', desc: 'evaluates a provided string as a javascript statement.', i: async function(args = []) {
                let cmd = args.join(' ');
                try {
                    let f = await eval('const jsm = require(\''+__dirname.replace(/\\/g, '/')+'/../util/base.js\'); ' +cmd);
                    util.util.log(cmd.split('.')[0], `${f?.tostring()}`.length > 1 ? f : 'undefined');
                } catch (e) {
                    util.util.log(chalk.bold.red(`${e}`.split(':')[0]), `${e}`.split(': ')[1]);
                }
            }},
            'task.run': {example: 'jsm --low task.run start', name: 'Task Runner', usage: 'jsm --low task.run <task>', desc: 'Runs a specific JSM task.', i: async function(args = []) {
                if (!args[0]) return util.util.log('undefined', 'not a valid operation');
                util.util.run_task(args[0], args.slice(1));
            }},
            'fexec': {example: 'jsm --low fexec ./test.js', name: 'File Executor', usage: 'jsm --low fexec <file>.js', desc: 'evaluates a javascript file.', i: async function(args = []) {
                const fs = require('fs');
                let f = args.join(' ');
                if (!fs.existsSync(f)) return console.log(util.errdescribe(f + ': File does not exist.'));
                process.once('uncaughtException', err => {
                    console.log(util.this(f), util.errdescribe(err));
                    process.exit(1);
                })   
                await require(f.startsWith('./') ? process.cwd() + '/' + f.replace('./', '') : f);
            }}
        }
        let op = findOperation[args[0]];
        if (!op || typeof op?.i != 'function') {
            args[0] ? console.log(chalk.red(args[0] + ' is not a valid operation.')) : console.log(chalk.red('Please define an operation.'));
            let f = findOperation['help'];
            f.i(['low'])
            return;
        }
        op?.i(args.slice(1));
    }
}