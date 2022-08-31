const helper = require('../app/helper.js');

module.exports = {
    name: 'Release Notes',
    example: 'jsm --release [ver]',
    usage: 'jsm --release [version]',
    desc: 'Shows the JSM release notes for the latest release or the specified version.', 
    async run(args = []) {
        let version = args[0] ?? require('../package.json').version;
        const fs = require('fs'), chalk = require('chalk');
            console.log(chalk.bold.yellow.strikethrough('*'.repeat(process.stdout.columns)));
            try {
            helper.console.writing.ConsoleWriting.writef(__dirname + '/changes/' + version + '.md');
            } catch { console.log(chalk.bold.red('The Release Note Viewer Utility could not find the release notes for the version ' + version +'.'))}
            console.log(chalk.bold.yellow.strikethrough('*'.repeat(process.stdout.columns)));
    }
}