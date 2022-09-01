let testStates = [];
const chalk = require('chalk')
const tester = {
    tests: {
        '1': {name: 'test-1', async run() {
            try {
                testStates.push(this.name + chalk.bold.green(': passed'));
            } catch {
                testStates.push(this.name + chalk.bold.red(': failed'));
            }
            setTimeout(() => {
                console.log(chalk.bold.blue(testStates[0]));
                tester['tests']['2'].run();
            }, 500)
        }},
        '2': {name: 'test-2', async run() {
            try {
                testStates.push(this.name + chalk.bold.green(': passed'));
            } catch {
                testStates.push(this.name + chalk.bold.red(': failed'));
            }
            setTimeout(() => {
            console.log(chalk.bold.blue(testStates[1]));
            tester['tests']['3'].run()
            }, 500);
        }},
        '3': {name: 'test-3', async run() {
            try {
                testStates.push(this.name + chalk.bold.green(': passed'));
            } catch {
                testStates.push(this.name + chalk.bold.red(': failed'));
            }
            setTimeout(() => {
                console.log(chalk.bold.blue(testStates[2]));
            }, 500);
        }}
    },
    async test() {
        let tests = this.tests;
        tests['1'].run();
    }
}
tester.test();