// General events
var EventManager = require("./eventmanager").EventManager;
var Grid = require("../model/grid").Grid;
var Maps = require("./maps").Maps;

EventManager.on("m.getGrids", function(user, data) {
    var grids = Grid.getGrids();

    for(var i in grids) {
        user.trigger("m.newGrid", grids[i]);
    }
});

EventManager.on("m.getMaps", function(user, data) {
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
        user.trigger("m.newMap", maps[i]);
    }
});

EventManager.on("m.createGrid", function(user, data) {
    var grid;
    // Validate the data we need
    if(typeof(data.map) != "number")
        user.trigger("m.createGridError", {error: "map"});
    if(data.name == undefined)
        user.trigger("m.createGridError", {error: "name"});
    if(data.name.length < 3 || data.name.length > 10)
        user.trigger("m.createGridError", {error: "name"});
    // Just to make sure
    data.name = escape(data.name);

    // So now we create a room
    grid = new Grid(data.name, Maps[data.map]);
    grid.host = user;

    user.trigger("m.createGridSuccess", {
        id: grid.id,
    });
});

EventManager.on("m.joinGrid", function(user, data) {
    var grid, pid;
    // Make sure we have an id
    if(data.id == undefined || typeof(data.id) != "number")
        return user.trigger("m.joinGridError", {error: "id"});
    var grid = Grid.store[data.id];
    // Make sure the grid exists
    if(grid == undefined)   
        return user.trigger("m.joinGridError", {error: "id"});
    
    // Add the user to the grid (and get a pid)
    pid = grid.addUser(user);

    // Create a list of player ids
    var players = [];
    for(var i in grid.users) {
        players.push(grid.users[i].player.id);
    }

    EventManager.trigger("g"+grid.id+".newPlayer", user, {
        'pid': pid
    });

    user.trigger("m.joinGridSuccess", {
        id: grid.id,
        pid: pid,
        host: grid.host.player.id,
        active: grid.active,
        colors: grid.map.colors,
        players: players
    });
});

EventManager.on("r.sub", function(user, e_data) {
     EventManager.on(e_data.e, function(other_user, data) {
        user.trigger(e_data.e, data);
     });
});

EventManager.on("r.ping", function(user, data) {
    user.trigger("r.ping", { hello: "world" });
});
