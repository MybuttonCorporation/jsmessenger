class MessageCollectionInstance {
    __messages = {
        '__DATA': [],
           FromString(__S="") {
            if (!__S.includes('\n')) return this.__DATA = __S;
            let __S_DATA = __S.split('\n');
            this.__DATA= __S_DATA;
           },
           FromArray(__A=[]) {
            return this.__DATA = __A;
           },
        /**
         * 
         * @param {*} __line line number (default is 0, the starting point.) 
         * @returns 
         */
        get(__line = 0) {
            return this.__DATA[__line];
        },
        add(__S) {
            this.__DATA.push(__S);
        },
        set(__l = 0, __s = "") {
            this.__DATA[__l] = __s;
        },
        /**
         * 
         * @param {*} __count Amount of times that the content will be popped for. (Default: 1)
         */
        remove(__count = 1) {
            for (let i = 0; i < __count; i++) {
                this.__DATA = this.__DATA.pop();
            }
        }
    }
    static #data = {};
    GetLine(__id) {
        return this.__messages.get(__id);
    };
    SetLine(__id, __str) {
        return this.__messages.set(__id, __str);
    };
    AddLine(__str) {
        return this.__messages.add(__str);
    };
    RemoveLine(__times = 1) {
        return this.__messages.remove(__times);
    };
    GetData() {
        let _global_args = [...arguments]
        return {
            index: this.__messages.__DATA,
            glindex: this,
            glargs: _global_args,
            format(__t) {
                let data = this.index;
                let type = {
                    'index': data,
                    'data': this.glargs,
                    'channel-data': function() {
                        return type.index.join('\n');
                    },
                    'joined': function() {
                        return type['data'].length < 1 ? type.index.join(', ') : type.index.join(type['data'][0]);
                    },
                    'raw': function() {
                        return type.index;
                    }
                }
                let _type = type[__t];
                return _type([...arguments]);
            },
            matches(mci = new MessageCollectionInstance()) {
                return mci.__messages.__DATA == this.glindex.__messages.__DATA;
            }
        };
    };
    match(mci = new MessageCollectionInstance()) {
        return this.__messages.FromArray(mci.__messages.__DATA);
    }
}

module.exports = MessageCollectionInstance;