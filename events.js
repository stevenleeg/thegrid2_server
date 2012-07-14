// General events
var EventManager = require("./eventmanager").EventManager;
var Grid = require("./model/grid").Grid;

EventManager.on("m.getGrids", function(user, data) {
    var grids = Grid.getGrids();

    for(var i in grids) {
        user.trigger("m.newGrid", grids[i]);
    }
});

EventManager.on("m.getMaps", function(user, data) {
    var maps = [
        {
            id: 0,
            name: "Sixteen",
            size: 16,
        }, {
            id: 1,
            name: "Thirty-two",
            size: 32
        }
    ]

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
    grid = new Grid(data.name, data.map);
    grid.addUser(user);

});

EventManager.on("r.ping", function(user, data) {
    user.trigger("ping");
});
