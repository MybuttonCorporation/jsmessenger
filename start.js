function start(args = []) {
    console.log(args);
    require('./app/init.js').start(args);
}
start(process.argv.slice(2));