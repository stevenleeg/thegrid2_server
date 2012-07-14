// General events
var EventManager = require("./eventmanager").EventManager;

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
EventManager.on("r.ping", function(user, data) {
    user.trigger("ping");
});
