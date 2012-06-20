var fs = require("fs");
var UpdateManager = require("../updatemanager").UpdateManager;

var Grid = function(name, map) {
    this.name = name;
    this.num_users = 0;
    this.active = false;
    
    // Generate an id
    this.id = Grid.uid;
    Grid.uid += 1;
    Grid.store[this.id] = this;
    Grid.names.push(name);

    // Some placeholders
    this.users = {};
    this.player_data = {};
    this.matrix = {};

    // Open the map file
    this.map = require("../maps/" + map).map;
    
    //
    // Gets a coord object
    //
    this.getCoord = function(x, y) {
        // Does it already exist?
        if(this.matrix[x] != undefined && this.matrix[x][y] != undefined)
            return this.matrix[x][y];

        // Nope. Let's create it
        if(this.matrix[x] == undefined)
            this.matrix[x] = {};
        if(this.matrix[x][y] == undefined)
            this.matrix[x][y] = {};

        this.matrix[x][y] = new Coord(this, x, y);
        return this.matrix[x][y];
    }

    //
    // Dumps all coords
    //
    this.dump = function() {
        var rets = {};
        for(var x in this.matrix) {
            for(var y in this.matrix[x]) {
                rets[x + "_" + y] = this.getCoord(x,y).baseInfo();
            }
        }

        return rets;
    }

    //
    // Triggers a map event
    //
    this.trigger = function(event) {
        if(this.map.events != undefined && this.map.events[event] != undefined)
            this.map.events[event](this, UpdateManager);
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
            return user.pid;

        // If they already have a pid
        if(pid != undefined) {
            if(this.users[pid] != undefined)
                return -1;

            this.users[pid] = user;
            this.num_users++;
            return pid;
        }

        // I guess we'll have to generate one
        pid = -1;
        for(var i = 0; i < this.map.maxPlayers; i++) {
            if(this.users[i] == undefined) {
                pid = i;
                break;
            }
        }
        // The room is full
        if(pid == -1)
            return -1;
        
        user.color = this.map.colors[pid];
        this.num_users++;
        this.users[pid] = user;
        return pid;
    }

    //
    // Removes a user from the grid
    //
    this.delUser = function(user) {
        // TODO: A better way to do this?
        for(var i in this.users) {
            if(this.users[i] == user) {
                this.num_users--;
                delete this.users[i];
                return true;
            }
        }
    }

    // Trigger an init event
    this.trigger("init");
}

Grid.uid = 0;
Grid.store = {};
Grid.names = [];

var Coord = function(grid, x, y) {
    this.grid = grid;
    this.x = x;
    this.y = y;

    this.baseInfo = function() {
        return {
            type: this.type,
            player: this.player,
            health: this.health,
            rot: this.rot
        }
    }
}

exports.Grid = Grid;
