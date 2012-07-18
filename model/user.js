var Async = require("../async").Async;
var EventManager = require("../utility/eventmanager").EventManager;
var events = require("events");
var util = require("util");

var User = function(connection) {
    // Generate a uid
    this.id = User.uid;
    User.uid += 1;
    this.connection = connection;
    User.store[this.id] = this;

    var that = this;
    events.EventEmitter.call(this);

    //
    // Used to call a function on the client
    //
    this.send = function(event, data) {
        var payload = {};
        payload.e = event;
        payload.data = data;

        this.connection.sendUTF(JSON.stringify(payload))
    }

    //
    // Removes the User from User.store
    // generally called upon socket close
    //
    this.remove = function() {
        if(this.grid != undefined)
            this.grid.delUser(this);
        delete User.store[this.id];
    }

    // Used for the menu when a new grid is created
    this.newGrid = function(grid) {
        that.send("m.newGrid", { id: grid.id, name: grid.name });
    }

    // Called when the user joins a grid
    this.joinGrid = function() {
        EventManager.off("m.newGrid", that.newGrid);
    }

    EventManager.on("m.newGrid", this.newGrid);
    this.on("joinGrid", this.joinGrid);
}
util.inherits(User, events.EventEmitter);

User.uid = 0;
User.store = {};

var Player = function(pid) {
    this.id = pid;
    this.init = false;

    this.cash = 0;
    this.inc = 0;
    this.tlim = 0;
    this.tused = 0;
}

exports.User = User;
exports.Player = Player;
