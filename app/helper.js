const chalk = require('chalk')
const fs = require('fs')
async function sleep(time) {
    const stop = new Date().getTime() + time;
    while(new Date().getTime() < stop);       
}
/**
 * @lmfcli consoleServices
 */
let con = {}
/**
 * @lmfcli consoleServices.writing
 * contains the writing classes
 */
con.writing = {
    /**
     * writingServices for the console
     */
    ConsoleWriting: {
        /**
         * 
         * writes a message to the console with color  
         * @param {*} $msg 
         * @param {*} $color
         * 
         */
        printc($msg, $color) {
            console.log(chalk[$color]($msg));
        },
        /**
         * 
         * writes a message to the console
         * @param {*} $msg 
         * 
         */
        printf($msg) {
            console.log($msg)
        },
        /**
         * 
         * 
         * writes the contents of a file to the console with highlighting
         * @param {*} $file
         * 
         * @version 1.0.0
         * @since 1.4.6 
         */
        writef($file) {
            //if the file does not exist, throw an error
            if (!fs.existsSync($file)) throw new RangeError("File does not exist.")
            //read contents of file and set it to str
            let str = fs.readFileSync($file, 'utf8');
            var handler = require('./handle')
            handler.writeIndex(str)
        }
    },
    /**
     * animations for the console
     */
    ConsoleAnimation: {
        /**
         * progressbar for the console. 
         * ```js
         * [==========================] 100%
         * ```
         * @param {*} $msg `title`
         * @param {*} $Rounds `length` 
         */
        $progress($msg = "", {$Rounds = 20, $Time = 50}) {

            //get the percentage of the progress bar
            
            for (iv = 0; iv <= $Rounds; iv++) {
                let $percent = Math.round(($Rounds * iv) / $Rounds * (100 / $Rounds));
                process.stdout.write("\r" + chalk.green("@") + chalk.yellow(":") + chalk.cyan($msg) + chalk.bold.red(" [") + chalk.bold.green("▬").repeat(iv) + `${chalk.black("▬")}`.repeat($Rounds - iv) + chalk.bold.red("] ") + chalk.bold.green($percent + chalk.bold.red("%")))
                sleep($Time)

            }
            console.log()
        },
        /**
         * 
         * a turning animation, with the title $msg, that goes from 0 to $Rounds with the timeout $Time.
         * ```bash
         * [ | ]
         * [ / ]
         * [ - ]
         * [ \ ]
         * [ | ]
         * ```
         * 
         * @param {*} $msg 
         * @param {*} $Round 
         * @param {*} $Time
         * 
         *  
         */
        $turn($msg = "", $Round = 20, $Time = 50) {
            for (i = 0; i <= $Round; i++) {
                let $percent = Math.round(($Round * i) / $Round * (100 / $Round));
                process.stdout.write(chalk.bold.green(" " +$percent + chalk.bold.red("%")) + chalk.bold.cyan("\r"+chalk.magenta($msg+" ")+"|"))
                sleep($Time)
                process.stdout.write(chalk.bold.green(" " +$percent + chalk.bold.red("%")) + chalk.bold.green("\r"+chalk.magenta($msg+" ")+"/"))
                sleep($Time)
                process.stdout.write(chalk.bold.green(" " +$percent + chalk.bold.red("%")) + chalk.bold.yellow("\r"+chalk.magenta($msg+" ")+"-"))
                sleep($Time)
                process.stdout.write(chalk.bold.green(" " +$percent + chalk.bold.red("%")) + chalk.bold.red("\r"+chalk.magenta($msg+" ")+"\\"))
                sleep($Time)
                chalk.reset();
            process.stdout.write(chalk.bold.green(" " +$percent + chalk.bold.red("%")) + chalk.bold.cyan("\r"+chalk.magenta($msg+" ")+"|"))
            }
            console.log()


        }
    }

}

module.exports = {
    scripts: {
        test() {
            con.writing.ConsoleWriting.writef(__dirname + "/client.js")
            con.writing.ConsoleWriting.printf("test")
            con.writing.ConsoleAnimation.$turn("test", 20, 50)
            con.writing.ConsoleAnimation.$progress("test", 20, 100)
        }
    },
    /**
     * @lmfcli consoleServices
     */
    console: con
}
