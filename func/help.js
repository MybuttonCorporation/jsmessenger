module.exports = {
    name: 'Help',
    usage: 'jsm --help [command]',
    example: 'jsm --help',
    desc: 'Gives information about an argument or displays all arguments.',
    async run(args = []) {
        const fs = require('fs'), chalk = require('chalk'), base = require('../util/base.js');
        if (args[0] && fs.existsSync(__dirname + '/'+args[0] + '.js')) {
            let f = require('./'+args[0]+'.js');
            console.log(base.describe(f));
            return;
        }
        else {
            let files = fs.readdirSync(__dirname, 'utf-8').filter(f => f.length > 1 && f.endsWith('.js'));
            files.forEach(f => {
                let file = require(__dirname + '/' + f);
                if (file.name == undefined) return;
                let file_first_name = f.at(0);
                if (!fs.existsSync(__dirname+'/'+file_first_name + '.js')) {process.stdout.write(chalk.bold.yellow('jsm --'+f.replace('.js', '')) + ' \t\t'); return base.util.log(file.name, chalk.bold.dim.black(file.desc));} 
                process.stdout.write(chalk.bold.yellowBright('jsm ') + chalk.bold.yellow('-'+file_first_name + ', --'+f.substring(-3)) + ' \t'); base.util.log(file.name, chalk.bold.dim.black(file.desc)); 
            })
            process.stdout.write(chalk.bold.yellowBright('jsm ') + chalk.bold.yellow('--join') + ' \t\t'); base.util.log('Quick Join', chalk.bold.dim.black('Joins the specified JSM channel.'));
            process.stdout.write(chalk.bold.yellowBright('jsm ') + chalk.bold.yellow('--dev') + ' \t\t'); base.util.log('Devmode', chalk.bold.dim.black('Enables developer mode, skipping the update and connectivity check.'));
        }
    }
}