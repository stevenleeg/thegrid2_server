var events = require("events");
var util = require("util");
var TileProps = require("./tileprops").TileProps;

var Grid = function(name, map) {
    var self = this;
    // Why does this have to be here?
    var Player = require("./user").Player;

    this.name = name;
    this.num_users = 0;
    this.active = false;
    
    // Generate an id
    this.id = Grid.uid;
    Grid.uid += 1;
    Grid.store[this.id] = this;
    Grid.names.push(name);

    // Log the fact that we exist
    console.log("[gid:"+this.id+"] Created " + this.name);

    // Some placeholders
    this.users = {};
    this.matrix = {};

    // Register the eventhandler
    events.EventEmitter.call(this);

    // And all of the user events
    for(var event in Grid.UserEvents) {
        this.on(event, Grid.UserEvents[event]);
    }
    delete(event);

    // Open the map file
    var Map = new require("../maps/" + map).Map;
    this.map = new Map(this);

    // Register any events
    for(var i in this.map.events) {
        this.on(i, this.map.events[i]);
    }

    // Generate the players object
    this.players = {};
    for(var i=0; i < this.map.maxPlayers; i++) {
        this.players[i] = new Player(i);
    }

    // Generate the matrix
    for(var x = 0; x < this.map.size; x++) {
        this.matrix[x] = {};
        for(var y = 0; y < this.map.size; y++) {
            this.matrix[x][y] = new Coord(this, x, y);
        }
    }
    
    //
    // Gets a coord object
    //
    this.getCoord = function(x, y) {
        // Looks like we're getting a string coord ugh
        if(typeof x == "string" && y == undefined) {
            var xy = x.split("_");
            x = parseInt(xy[0]);
            y = parseInt(xy[1]);
        } else {
            x = parseInt(x);
            y = parseInt(y);
        }
        // Does it already exist?
        if(this.matrix[x] != undefined && this.matrix[x][y] != undefined)
            return this.matrix[x][y];

        // Ensure we're working only with ints
        if(typeof x != "number" || typeof y != "number")
            return false;

        return this.matrix[x][y];
    }

    //
    // Dumps all coords
    //
    this.dump = function() {
        var rets = {};
        for(var x in this.matrix) {
            for(var y in this.matrix[x]) {
                var coord = this.getCoord(x,y);
                if(coord.exists())
                    rets[x + "_" + y] = coord.baseInfo();
            }
        }

        return rets;
    }

    //
    // Allows for bulk modification of coordinates
    // The input is an object like this:
    // { 
    //     1_1: {
    //         prop: val,
    //         prop: val
    //     },
    //     ...
    // }
    //
    this.bulkModify = function(obj) {
        var coord;
        // Loop through the coords to be modified
        for(var i in obj) {
            coord = this.getCoord(i);
            // Loop through each property to be modified
            for(var key in obj[i]) {
                // Set the property
                coord[key] = obj[i][key];
            }
            this.emit("updateCoord", coord);
        }
    }
    
    //
    // Tests if a coordinate exists
    //
    this.coordExists = function(x, y) {
        if(this.matrix[x] != undefined && this.matrix[x][y] != undefined)
            return true;
        return false;
    }

    //
    // Adds a user to the grid's list of players
    // and returns a pid
    //
    // If it returns -1, that means the grid
    // is full.
    //
    this.addUser = function(user, pid) {
        var pid;
        // If they're already in the game
        if(user.grid == this)
            return user.player.pid;

        // If they already have a pid
        if(pid != undefined && this.users[pid] != undefined) {
                return -1;
        } else {
            // I guess we'll have to generate one
            pid = -1;
            for(var i = 0; i < this.map.maxPlayers; i++) {
                if(this.users[i] == undefined) {
                    pid = i;
                    break;
                }
            }
        }
        // The room is full
        if(pid == -1)
            return -1;
        
        // Let everyone know
        this.emit("addPlayer", pid);
        // Increase the user count and cancel deletion
        this.num_users++;
        clearTimeout(this.remove_timeout);

        // Set their color TODO: Is this used anywhere?
        user.color = this.map.colors[pid];
        this.users[pid] = user;

        // Set up the player
        user.player = this.players[pid];
        user.player.active = true;

        // Do we need to assume the position of host?
        if(this.num_users == 1) {
            this.host = user;
        }

        // Assign the user to us
        user.grid = this;
        // Set up event listeners
        for(var i in Grid.UserListeners) {
            user.on(i, Grid.UserListeners[i]);
        }
        return pid;
    }

    //
    // Removes a user from the grid
    //
    this.delUser = function(user) {
        // TODO: A better way to do this?
        for(var i in this.users) {
            if(this.users[i] == user) {
                this.emit("delPlayer", user.player.id);
                this.num_users--;

                // Remove some properties from the user
                user.player.active = false;
                user.player = undefined;
                delete this.users[i];

                if(this.num_users == 0)
                    return this.remove();
                // See if we need a new host
                if(this.host == user && this.num_users != 0) {
                    for(var new_host in this.users) break;
                    new_host = this.users[new_host];
                    this.host = new_host;
                    this.emit("newHost", new_host);
                }

                return true;
            }
        }
    }

    this.sendUsers = function(event, data) {
        for(var i in this.users) {
            this.users[i].send(event, data);
        }
    }

    this.remove = function() {
        this.remove_timeout = setTimeout(function() {
            console.log("[gid:" + self.id + "] Deleting " + self.name);
            delete(Grid.store[self.id]);
        }, 60000);
    }

    // Trigger an init event
    this.emit("init");
}

Grid.getGrids = function() {
    var store, send;
    store = Grid.store;

    send = [];
    for(var i in store) {
        send.push({
            id: store[i].id,
            name: store[i].name,
        });
    }

    return send;
}

/*
 * Event listeners that send data to users to keep them
 * up to date
 */
Grid.UserEvents = {
    addPlayer: function(pid) {
        this.sendUsers("g.addPlayer", { pid: pid});
    },
    delPlayer: function(pid) {
        this.sendUsers("g.delPlayer", { pid: pid });
    },
    newHost: function(user) {
        this.sendUsers("g.newHost", { pid: user.player.id });
    },
    startGrid: function() {
        this.sendUsers("g.startGrid");
        this.active = true;
    },
    newChat: function(user, message) {
        this.sendUsers("g.newChat", {
            pid: user.player.id,
            msg: message
        });
    },
    updateCoord: function(coord) {
        this.sendUsers("g.updateCoord", {
            coord: coord.toString(),
            player: coord.player,
            type: coord.type,
            health: coord.health
            // TODO: Rotation data?
        });
    },
}

/*
 * Event handlers that listen for user data
 */
Grid.UserListeners = {
    'g.startGrid': function(user, data) {
        var grid = user.grid;
        if(user.grid.host != user)
            return;
        grid.emit("startGrid");
    },
    "g.getDump": function(user, data) {
        user.send("g.setDump", user.grid.dump());
    },
    "g.sendChat": function(user, data) {
        user.grid.emit("newChat", user, data.msg.substring(0,140));
    },
    "g.placeTile": function(user, data) {
        var coord = user.grid.getCoord(data.coord);
        if(!coord.place(data.type, user))
            return;
        // Reduce cash here
    }
}
util.inherits(Grid, events.EventEmitter);

Grid.uid = 0;
Grid.store = {};
Grid.names = [];

var Coord = function(grid, x, y) {
    var self = this;
    self.grid = grid;
    // Ensure we're working with numbers
    if(typeof x != "number" || typeof y != "number")
        throw "Invalid coordinate";
    self.x = x;
    self.y = y;

    // Basic information
    self.type = 0;
    self.player = -1;
    self.health = 0;
    self.rot = 0;

    self.exists = function() {
        return (self.type > 0) ? true : false;
    }

    // Places a tile type on this coordinate
    // for a user. Returns true/false based on 
    // whether or not the placement was a success
    self.place = function(type, user) {
        if(!TileProps[type].place(self.grid, self, user))
            return false;

        self.type = type;
        self.health = self.getProperty("health");
        self.player = user.player.id;

        // Announce the change to the grid
        self.grid.emit("updateCoord", self);
    }

    self.baseInfo = function() {
        return {
            type: self.type,
            player: self.player,
            health: self.health,
            rot: self.rot
        }
    }

    self.toString = function() {
        return self.x + "_" + self.y;
    }

    self.getProperty = function(key) {
        if(TileProps[self.type] == undefined) return;
        return TileProps[self.type][key];
    }
}

exports.Grid = Grid;
