var Async = require("../async").Async;

var User = function(connection) {
    // Generate a uid
    this.id = User.uid;
    User.uid += 1;
    this.connection = connection;
    User.store[this.id] = this;

    //
    // Used to call a function on the client
    //
    this.call = function(func, payload) {
        if(payload == undefined) payload = {};
        payload['f'] = func;

        this.connection.sendUTF(JSON.stringify(payload))
    }

    //
    // Callback for receiving a message
    //
    this.on_message = function(msg) {
        var ret;
        try {
            msg = JSON.parse(msg.utf8Data);
        } catch(e) {
            console.log("[usr:" + this.id + "] ERROR: Invalid JSON message");
            return
        }

        ret = Async[msg['f']](this, msg);
        ret['cid'] = msg['cid'];
        this.connection.sendUTF(JSON.stringify(ret));
    }

    //
    // Removes the User from User.store
    // generally called upon socket close
    //
    this.remove = function() {
        if(this.grid != undefined)
            grid.delUser(this);
        delete User.store[this.id];
    }
}

User.uid = 0;
User.store = {};

exports.User = User;
