// General events
var EventManager = require("./eventmanager").EventManager;
var Grid = require("../model/grid").Grid;
var Maps = require("./maps").Maps;

exports.UserEvents = {
    'm.getGrids': function(user, data) {
        var grids = Grid.getGrids();

        for(var i in grids) {
            user.send("m.newGrid", grids[i]);
        }
    },

    'm.getMaps': function(user, data) {
        var maps = []
        for(var i in Maps) {
            var Map = require("../maps/" + Maps[i]).Map;
            var map = new Map();
            maps.push({
                id: i,
                name: map.name,
                size: map.size
            });
            delete Map;
            delete map;
        }

        for(var i in maps) {
            user.send("m.newMap", maps[i]);
        }
    },

    'm.createGrid': function(user, data) {
        var grid;
        // Validate the data we need
        if(typeof(data.map) != "number")
            user.send("m.createGridError", {error: "map"});
        if(data.name == undefined)
            user.send("m.createGridError", {error: "name"});
        if(data.name.length < 3 || data.name.length > 10)
            user.send("m.createGridError", {error: "name"});
        // Just to make sure
        data.name = escape(data.name);

        // So now we create a room
        grid = new Grid(data.name, Maps[data.map]);
        grid.host = user;

        // Let everyone else know
        EventManager.emit("m.newGrid", grid);

        user.send("m.createGridSuccess", {
            id: grid.id,
        });
    },

    'm.joinGrid': function(user, data) {
        var grid, pid;
        // Make sure we have an id
        if(data.id == undefined || typeof(data.id) != "number")
            return user.send("m.joinGridError", {error: "id"});
        var grid = Grid.store[data.id];
        // Make sure the grid exists
        if(grid == undefined)   
            return user.send("m.joinGridError", {error: "id"});
        
        // Add the user to the grid (and get a pid)
        pid = grid.addUser(user);

        if(pid == -1) 
            return user.send("m.joinGridError", { error: "full" });

        // Create a list of player ids
        var players = [];
        for(var i in grid.users) {
            players.push(grid.users[i].player.id);
        }

        user.send("m.joinGridSuccess", {
            id: grid.id,
            pid: pid,
            host: grid.host.player.id,
            active: grid.active,
            colors: grid.map.colors,
            players: players,
        });
    },

    'r.sub': function(user, e_data) {
         EventManager.on(e_data.e, function(other_user, data) {
            user.send(e_data.e, data);
         });
    },

    'r.ping': function(user, data) {
        user.send("r.ping", { hello: "world" });
    },
}
