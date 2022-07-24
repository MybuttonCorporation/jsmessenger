const axiosf = require("axios");
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
        } catch {
            return res.status == 400;
        }
    };
    if (type == 'POST') {
        try {
        let data       = await axios.post(requestPath, body);
        res.status     = data.status;
        res.statusText = data.statusText;
        res.response   = data.data;
        } catch {
            return res.status == 400;
        }
    };
    return res;
}

module.exports = {
    async createChannel(cname = "", channelID = "") {
        let body = {
            channelID: channelID,
            channelName: cname
        };
        let response = await request('POST', '/chat/create', body);
        if (response.status == 400) return 400;
        if (response.status == 405) return 405;
    },
    async getMessages(channelID = "") {
        let response = await request('GET', `/chat/load/${channelID.replace('#', '')}`);
        if (response.status == 400) return 400;
        if (response.status == 404) return 404;
        return response;
        
    },
    async sendMessage(channelID = "", content = "") {
        content = content.replace('&time', `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`)
        let response = await request('POST', '/chat/send', {channelID: channelID, content: content})
        if (response.status == 400) return 400;
        if (response.status == 401) return 401;
        if (response.status == 404) return 404;
        return response;
    },
    user: {
        async registerUser(name, uid) {
            let response = await request('POST', '/user/create', {uid: uid, name: name});
            return response;
        },
        async loginAsUser(uid) {
            let response = await request('POST', '/user/set', {uid: uid, key: 'online', value: true})
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
