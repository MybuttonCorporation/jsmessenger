var jQueryScript = document.createElement('script');
jQueryScript.setAttribute('src','https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js');
document.head.appendChild(jQueryScript);
function changeColor(text = "", color = "") {
  $("span:contains('"+text+"')").css("color", color);
  console.log($("span:contains('"+text+"')").css("color", color));
}
function replaceAll(str = "", find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
function replaceColors(text) {
    let colors = [,
        {code: '\033[0m ',end: '\x1B[39m', name: 'reset'},// reset
        {code: '\033[30m',end: '\x1B[39m', name: 'black'}, // black
        {code: '\033[31m',end: '\x1B[39m', name: 'red'}, // red
        {code: '\033[32m',end: '\x1B[39m', name: 'green'}, // green
        {code: '\033[33m',end: '\x1B[39m', name: 'yellow'}, // yellow
        {code: '\033[34m',end: '\x1B[39m', name: 'blue'}, // blue
        {code: '\033[35m',end: '\x1B[39m', name: 'magenta'}, // magenta
        {code: '\033[36m',end: '\x1B[39m', name: 'cyan'}, // cyan
        {code: '\033[37m',end: '\x1B[39m', name: 'gray'}, // gray

        {code: '\033[1m' ,end: '\x1B[22m', name: 'bold'}, // bold
        {code: '\033[9m' ,end: '\x1B[29m', name: 'strikethrough'}, // strikethrough
        {code: '\033[3m' ,end: '\x1B[23m', name: 'italic'}, // italic
        {code: '\033[4m' ,end: '\x1B[24m', name: 'underline'}, // underline
        {code: '\033[40m',end: '\x1B[49m', name: 'bgBlack'}  // bgBlack
    ]
    let returntext = text;
    let changeColor = {
        // Modifiers
        'bold': (data, i = {code: '', end: ''}) => replaceAll(replaceAll(data, i.code, '<b>'), i.end, '</b>'),
        'strikethrough': (data, i = {code: '', end: ''}) => replaceAll(replaceAll(data, i.code, '<strike>'), i.end, '</strike>'),
        'italic': (data, i = {code: '', end: ''}) => replaceAll(replaceAll(data, i.code, '<i>'), i.end, '</i>'),
        'underline': (data, i = {code: '', end: ''}) => replaceAll(replaceAll(data, i.code, '<u>'), i.end, '</u>'),
        'bgBlack': (data, i = {code: '', end: ''}) => replaceAll(replaceAll(data, i.code, '<code>'), i.end, '</code>'),
        // Colors
        'reset': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'white'),
        'black': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'black'),
        'red': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'red'),
        'green': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'green'),
        'yellow': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'yellow'),
        'blue': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'blue'),
        'magenta': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'purple'),
        'cyan': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'cyan'),
        'gray': (data, i = {code: '', end: ''}) => changeColor(replaceAll(replaceAll(data, i.code, '<span>'), i.end, '</span>'), 'gray'),
    }
    colors.forEach(i => {
        let replaced = changeColor[i.name](returntext, i);
        returntext = replaced;
    });
    return returntext;    
}
let data = document.getElementById('text-info');
data.innerHTML = "<span>test</span>";
let _str=`
[8:34:12] The channel started with the name b.
[1m[35m>>[39m[22m [1m[33m[11:34:9][39m[22m [1m[35mnehir[39m[22m joined the chat room.
[1m[33m[11:34:37][39m[22m [1m[35mnehir[39m[22m: [1m[37mhelo my friend[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
[1m[33m[[1m[31mSERVER[39m[33m[22m[1m][39m[22m channel [1m[4m[35m#000497.ch[39m[24m[22m is rebooting for a server-sided update.
[1m[35m>> [39m[22m[1m[33mServer Updating...[39m[22m
[1m[35m>> [39m[22m[1m[33mServer updated <server.updater.update>[39m[22m
`;
let nocolor = 
console.log(replaceColors(_str));