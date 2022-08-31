const fs = require('fs'), chalk = require('chalk'), util = require('../util/base');
module.exports = {
    name: 'Profile Viewer',
    usage: 'jsm --profile',
    example: 'jsm --profile',
    desc: 'Shows your profile information.',
    async run(args = []) {
        if (!fs.existsSync(process.cwd() + '/jsmdb.json')) return util.util.log('Profile', 'you are not registered on this device.');
        let data = require(process.cwd() + '/jsmdb.json');
        console.log(chalk.bold.strikethrough.yellow('.-'.repeat('username'.length + '\t\t'.length + `${data.user.name}`.length) + '.'))
        console.log(chalk.bold.red('      [User Configuration]'))
        process.stdout.write(' '); util.util.log('Username', '\t\t'+data.user.name);
        process.stdout.write(' '); util.util.log('User ID', '\t\t'+data.user.id);
        process.stdout.write(' '); util.util.log('Prefered Language', ''+data.cli_lang);
        console.log(chalk.bold.underline.yellow('.-'.repeat('username'.length + '\t\t'.length + `${data.user.name}`.length) + '.'))
    }
}