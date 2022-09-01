const chalk = require('chalk');
module.exports = {
    cthis: 'main',
    set: (name) => this.cthis = name,
    this: (name) => `${chalk.bold.magenta('[')}${chalk.bold.green(name)}${chalk.bold.magenta(']')}` ?? 'test',
    describe: (data) => `${chalk.bold.magenta(data.name)} ${chalk.bold.green('»')} ${chalk.bold.blue(data.desc)}\n${chalk.bold.red('-')} ${chalk.magenta('»')} ${chalk.bold.yellow(data.usage)}\n${chalk.underline.red('Example')} ${chalk.bold.bgBlack.green(data.example)}`,
    errdescribe: (e) => `${chalk.bold.red(`${chalk.bold.magenta('[')}${`${e}`.split(':')[0]}${chalk.bold.magenta(']')}`)} ${chalk.bold.blue(`${e}`.split(': ')[1])}`,
    res: (_t) => `${chalk.bold.blue(_t)}`,
    util: {
        log(logger = __filename, txt = '') {
            console.log(chalk.bold.red('-'), chalk.bold.magenta('»'), chalk.bold.green(logger) + chalk.bold.grey(':'), chalk.red(txt));
        },
        checkStatus() {
            if (typeof this.run_task == 'function') return 'alive';
            return 'halted';
        },
        run_task(t = 'start', args = []) {
            let jsm_base = require('../app/init.js');
            if (typeof jsm_base[t] != 'function') {this.log(t, 'not a method within app/init.js'); return process.exit(0);}
            jsm_base[t](args);
        },
    },
    c: {
        remote: (data) => `${chalk.bold.yellow('[')}${chalk.red(data)}${chalk.bold.yellow(']')}`,
        err: (data) => `${chalk.bold.red(data)}`, 
        errc: (remote, data = new Error()) => `${chalk.bold.yellow('[')}${chalk.bold.red(remote)}${chalk.bold.yellow(']')}`
    },
    log(type = undefined || '', data = undefined || '', {template = false}) {
        let tc = type == 'info' ? 'blue' : type == 'err' ? 'red' : 'green';
        let builder = `${this.bgColor().gray(this.cthis)} ${this.bgColor()[tc](type == 'err' ? 'err!' : type == 'info' ? 'notice' : type)} ${chalk.bold.white(data)}`
        if (template) return builder;
        console.log(builder);
    },
    bgColor: (color) => chalk['bg' + color] ?? chalk.bgBlack
}