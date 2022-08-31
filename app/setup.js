const  
    chalk = require('chalk'),
    worker = require('./worker'),
    wio = require('wio.db'),
    db = new wio.JsonDatabase({databasePath: './lmfdb.json'});


module.exports = {
    language: {
        value: db.has('cli_lang') ? db.get('cli_lang') : 'english',
        isSet: db.has('cli_lang'),
        setup() {
            let sys = '';
            console.log(chalk.bold.yellow('Select your preferred client language:'))
            let languages = ["english (English)", "turkish (Türkçe)", "french (Français)", "german (Deutch)", "italian (Italiano)"]
            let i = 0;
            languages.forEach(lang => {
                i++;
                console.log(chalk.magenta('>'), chalk.bold.yellow(i + ':'), chalk.underline.bold.red(lang));
            });
            let rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
            rl.question(`${chalk.bold.underline.yellow('Select a language [1-'+languages.length+']')}`, response => {
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
                this.set(languages[responseInNumber-1])
                rl.close();
                sys = 'DONE';
                return 'DONE';
            })
        },
        set(language = "") {
            db.set('cli_lang', language);
        }
    }    
}