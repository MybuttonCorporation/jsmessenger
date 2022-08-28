const fs = require('fs');
const chalk = require('chalk');

class handle {
    data;
    src;
    constructor() {
    }
    #escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      }
    #replaceAll(str, match, replacement){
        return str.replace(new RegExp(this.#escapeRegExp(match), 'g'), ()=>replacement);
     }
    writeIndex($data = "") {
        //replace all instances of '#' in $data with '\n'
        let $split = $data.split('\n')
        $split.forEach(line => {
            if (line.startsWith('# ')) {
                var $dt = line.replace('# ', '')
                console.log(chalk.bold.yellow($dt))
                
            }
            else if (line.startsWith('$ ')) {
                var $dt = line.replace('$ ', '')
                console.log(chalk.bold.green($dt))
            }
            else {
            let $result1 = this.#replaceAll(line, 'lmf-cli', chalk.bold.red('lmf-cli'))
            let $result2 = this.#replaceAll($result1, 'lmfcli', chalk.bold.red('lmfcli'))
            let $result3 = this.#replaceAll($result2, 'error', chalk.bold.bgRed.white('error'))
            let $result4 = this.#replaceAll($result3, 'success', chalk.bold.bgGreenBright.white('success'))
            let $result5 = this.#replaceAll($result4, 'err', chalk.bold.bgRed.white('err'))
            let $result6 = this.#replaceAll($result5, 'notice', chalk.bold.bgBlue.white('notice'))
    
            let $result7 = this.#replaceAll($result6, '*', chalk.bold.yellow('*'))
            let $result8 = this.#replaceAll($result7, '-', chalk.bold.red('-'))
            let $result9 = this.#replaceAll($result8, '+', chalk.bold.green('+'))
            let $result10 = this.#replaceAll($result9, '#', chalk.bold.red('#'))
            let $result11 = this.#replaceAll($result10, '$', chalk.bold.cyan('$'))
            let $result12 = this.#replaceAll($result11, '@', chalk.bold.magenta('@'))
            let $result13 = this.#replaceAll($result12, '%', chalk.bold.blue('%'))
            let $result14 = this.#replaceAll($result13, '^', chalk.bold.gray('^'))
            let $result15 = this.#replaceAll($result14, '&', chalk.bold.black('&'))
            let $result16 = this.#replaceAll($result15, '!', chalk.bold.gray('!'))
            let $result17 = this.#replaceAll($result16, ' ?', chalk.bold.gray('?'))
            let $result17_1 = this.#replaceAll($result17, '?', chalk.bold.gray('?'))
            let $result18 = this.#replaceAll($result17_1, '~', chalk.bold.gray('~'))
            let $result19 = this.#replaceAll($result18, '`', chalk.bold.gray('`'))
            let $result20 = this.#replaceAll($result19, 'cli', chalk.bold.red('cli'))
            console.log($result20)
            }
        })


    }
    //$type must be err, notice or success
    con_printf($type = ("notice", "err", "success"), $data) {
        const COLOR = $type === 'notice' ? 'blue' : $type === 'err' ? 'red' : 'green';
        console.log(chalk.bold.white('lmf-cli ') + chalk[COLOR]($type), $data)
    }
    
}
module.exports = new handle();