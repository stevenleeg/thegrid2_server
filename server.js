var WebSocketServer = require("websocket").server;
var Express = require("express");
var User = require("./model/user").User;
var Grid = require("./model/grid").Grid;
var EventManager = require("./eventmanager").EventManager;

var app = Express.createServer();
app.listen(8080);

var srv = new WebSocketServer({
    httpServer: app
});

// Some general events
EventManager.on("g.getGrids", function(user, data) {
    var grids = Grid.getGrids();

    for(var i in grids) {
        user.trigger("m.newGrid", grids[i]);
    }
});
EventManager.on("g.getMaps", function(user, data) {
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
EventManager.on("g.ping", function(user, data) {
    user.trigger("ping");
});

srv.on("request", function(req) {
    try {
        var connection = req.accept("grid-1.0", req.origin);
    } catch(e) {
        req.reject();
        return;
    }
    connection.user = new User(connection);
    console.log("[usr:" + connection.user.id + "] Connected");

    connection.on("message", function(message) {
        var msg = JSON.parse(message.utf8Data);
        EventManager.trigger(msg.e, connection.user, msg.data);
    });

    connection.on("close", function() {
        console.log("[usr:" + connection.user.id + "] Disconnected");
        connection.user.remove();
    });
});

console.log("[srv] Server ready");
