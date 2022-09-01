const axiosf = require("axios");
const chalk = require("chalk");
const wio = require('wio.db')
const db = new wio.JsonDatabase({databasePath: './jsmdb.json'});
const axios = axiosf.default;
axios.defaults.headers.common['highWaterMark'] = 1024 * 1024 * 10
const request = async (type, path, body = {}) => {
    let basePath = 'https://jsmsgserver.nehirkedi.repl.co';
    let requestPath = basePath + path;
    let res = {};
    if (type == 'GET') {
        try {
        let data = await axios.get(requestPath);
        res.status = data.status;
        res.statusText = data.statusText;
        res.response = data.data;
        } catch (e) {
            return 400;
        }
    };
    if (type == 'POST') {
        try {
        let data       = await axios.post(requestPath, body);
        res.status     = data.status;
        res.statusText = data.statusText;
        res.response   = data.data;
        } catch (e) {
            return 400;
        }
    };
    if (res.response.remoteContent != undefined) {
        let data = res.response.remoteContent;
        let { message, type } = data;
        remoteMessage(type, message);
    } 
    return res;
}
function remoteMessage(type, message) {
    let data = {
        'ERR': chalk.bold.red,
        'SUC': chalk.bold.green,
        'INFO': chalk.bold.blue
    }[type];
    console.log(chalk.bold.yellow(`\n[${data('remote')}] `) + chalk.bold.white(message))
}
module.exports = {
    async createProxy(uid = "") {
        let events = require('events');
        let listener = new events.EventEmitter();
        let proxy = { listener, connection: {authentication: false, path: '/proxy/'+uid, server: 'https://jsmsgserver.nehirkedi.repl.co/', port: 8080}, async destroy() { clearInterval(interval); },
            async authenticate(password = "") {
                let res = await request('POST', '/proxy/authenticate', {uid: uid, password: password});
                return res.response;
            },
            async send(command = "") {
                let res = await request('POST', '/proxy/run', {uid: uid, command: command});
                if (res.response?.PROXY_CONNECTION?.req == 'question') {
                    let data = res.response?.PROXY_CONNECTION;
                    proxy.listener.emit('question', {title: data?.title, state: data?.state, res: data?.res});
                }
                else if (res.response?.PROXY_CONNECTION?.req == 'log') {
                    let data = res.response?.PROXY_CONNECTION.message;
                    console.log(`${chalk.bold.yellow('['+chalk.bold.red('REMOTE/PROXY/'+uid.toLocaleUpperCase())+']')}${chalk.bold.dim(':')} ${chalk.bold.bgBlack.magenta(data)}`);
                }
                else if (res.response?.PROXY_CONNECTION) proxy.listener.emit(res.response?.PROXY_CONNECTION?.req, res.response?.PROXY_CONNECTION);
                return res;
            }
        };
        let path = "/proxy";
        let interval = setInterval(async function() {
            let res = await request('POST', path, {uid: uid});
            path = "/proxy"
            if (res.response?.PROXY_CONNECTION?.req == 'question') {
                let data = res.response?.PROXY_CONNECTION;
                proxy.listener.emit('question', {title: data?.title, state: data?.state, res: data?.res});
            }
            if (res.response?.PROXY_CONNECTION?.req == 'log') {
                let data = res.response?.PROXY_CONNECTION.message;
                console.log(`${chalk.bold.yellow('['+chalk.bold.red('REMOTE/PROXY/'+uid.toLocaleUpperCase())+']')}${chalk.bold.dim(':')} ${chalk.bold.bgBlack.magenta(data)}`);
            }
        }, 2000);
        return proxy;
    },
    async request(type, path, body = {}) {
        let basePath = 'https://jsmsgserver.nehirkedi.repl.co';
        let requestPath = basePath + path;
        let res = {};
        if (type == 'GET') {
            try {
            let data = await axios.get(requestPath);
            res.status = data.status;
            res.statusText = data.statusText;
            res.response = data.data;
            } catch (e) {
                return 400;
            }
        };
        if (type == 'POST') {
            try {
            let data       = await axios.post(requestPath, body);
            res.status     = data.status;
            res.statusText = data.statusText;
            res.response   = data.data;
            } catch (e) {
                return 400;
            }
        };
        if (res.response?.remoteContent != undefined) {
            let data = res.response.remoteContent;
            let { message, type } = data;
            remoteMessage(type, message);
        }
        return res;
    },
    async createChannel(cname = "", channelID = "") {
        let body = {
            channelID: channelID,
            channelName: cname
        };
        let response = await request('POST', '/chat/create', body);
        return response;
    },
    async getMessages(channelID = "") {
        let response = await request('GET', `/chat/load/${channelID.replace('#', '')}`);
        if (response.status == 400) return 400;
        if (response.status == 404) return 404;
        return response;
        
    },
    async sendMessage(channelID = "", content = "") {
        content = content.replace('&time', `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`).replace('&admin', `${chalk.bold.yellow('[')}${chalk.bold.red('ADMIN')}${chalk.bold.yellow(']')}`).replace('%n', '\n')
        if (!content.includes('>>')) content = chalk.bold.magenta('>> ') + content;
        let colors = ['\x1B[32m', /*green*/'\x1B[33m', /*yellow*/'\x1B[31m', /*red*/'\x1B[34m' /**blue */, '\x1B[35m', /*magenta*/, '\x1B[90m', /*gray*/, '\x1B[30m', /*black*/, '\x1B2m'/*dim*/, '\x1B[36m', /*cyan*/, '\x1B[37m' /*white*/, '\x1B[4m', /*underline*/, '\x1B[1m' /*bold*/]
        let names  = ['green', 'yellow', 'red', 'blue', 'magenta', 'gray', 'black', 'dim', 'cyan', 'white', 'underline', 'bold']
        let i = 0;
        names.forEach(clr2 => {
            names.forEach(clr => {
                let color = colors[i];
                content = content.replace('%' + clr, color).replace('undefined', '');  
                i++;
            })    
        })
        if (content.startsWith('#') && content.endsWith('?')) {
            let userf = content.split('->');
            this.user ? '' : this.user = this.user;
                let data = userf[1];
                if (data == 'isdev?') {
                    let __str_index_formatted_as_admin = userf[0].includes('@');
                    this.logging?.PrintRemoteInfoMessage(userf[0].substring(1) + '.' + data + ':', __str_index_formatted_as_admin);
                    if (!this.logging) {
                      console.log(chalk.bold.magenta('>> ') + chalk.bold.yellow(`[${chalk.bold.blue('remote')}]`) + `${chalk.bold.white(': ' +userf[0].substring(1) + '.' + data + ': ' + __str_index_formatted_as_admin)}`)
                    }
                }
                return 400;
        }
        if (this.user == undefined) this.user = this.user;
        let response = await request('POST', '/chat/send', {channelID: channelID, content: content, auth: this.user != undefined ? this.user.__LOCAL_USER_UNIQUE_ID : 'jsm.admin'})
        if (response.status == 400) return 400;
        if (response.status == 401) return 401;
        if (response.status == 404) return 404;
        return response;
    },
    logging: {
        PrintRemoteErrorMessage(s = "") {
            let data = s.split('\n');
            data.forEach(line => {
                console.log(chalk.bold.magenta('>> ') + chalk.bold.yellow(`[${chalk.bold.redBright('remote')}]`) + `${chalk.bold.white(': ' + line)}`)
            });
        },
        PrintRemoteInfoMessage(s = "") {
            let data = s.split('\n');
            data.forEach(line => {
                console.log(chalk.bold.magenta('>> ') + chalk.bold.yellow(`[${chalk.bold.blueBright('remote')}]`) + `${chalk.bold.white(': ' + line)}`)
            });
        },
        PrintRemoteSuccessMessage(s = "") {
            let data = s.split('\n');
            data.forEach(line => {
                console.log(chalk.bold.magenta('>> ') + chalk.bold.yellow(`[${chalk.bold.greenBright('remote')}]`) + `${chalk.bold.white(': ' + line)}`)
            });
        }
    },
    user: {
        async getId(name) {
            let response = await request('GET', '/user/' + name + '/getid')
            return response;
        },
        /**
         * 
         * @param {*} channel 
         * @param {*} uid 
         * @returns 
         * @deprecated unused : will not work
         */
        async blockUser(channel, uid) {
            let response = await request('POST', '/chat/block', {channel: channel, user: uid});
            return response;
            // : #block Nehir <reason>
            // %purple>> %yellow[%redremote%yellow]%white: you have been blocked: <reason>
        },
        __LOCAL_USER_UNIQUE_ID: "",
        async registerUser(name, uid) {
            let response = await request('POST', '/user/create', {uid: uid, name: name});
            return response;
        },
        async loginAsUser(uid) {
            let response = await request('POST', '/user/set', {uid: uid, key: 'online', value: true})
            this.__LOCAL_USER_UNIQUE_ID = uid;
            return response;
        },
        async logoutAsUser(uid) {
            let response = await request('POST', '/user/set', {uid: uid, key: 'online', value: false})
            return response;
        },
        async deleteUser(uid) {
            let response = await request('POST', '/user/delete', {uid: uid})
            return response;
        },
        async userExists(uid) {
            let response = await request('GET', '/user/'+uid+'/exists');
            return response;
        },
        async getUserMail(uid) {
            let response = await request('GET', '/user/'+uid+'/getmail');
            return response;
        },
        async setUserData(uid, key, value) {
            let response = await request('POST', '/user/set', {
                uid: uid,
                key: key,
                value: value
            });
            return response;
        },
        async getUserData(uid, key) {
            let response = await request('GET', '/user/'+ uid +'/get/'+key);
            return response;
        },
        async getUserFriends(uid) {
            let response = await request('GET', '/user/'+uid+'/friends');
            return response;
        },
        async getUserName(uid) {
            let response = await request('GET', '/user/'+ uid + '/base');
            return response;
        },
        async addFriend(uid, frienduid) {
            let response = await request('POST', '/user/addfriend', {uid: uid, frienduid: frienduid})
            return response;
        },
        async sendMail(uid, title, author, content) {
            const time = new Date().getDay() + '/' + (new Date().getMonth()+1) +'/'+ new Date().getFullYear().toString().substring(2);
            let response = await request('POST', '/user/sendmail', {uid: uid, title: title, authorid: author, content: content, time: time})
            return response;
        }
    }
}
