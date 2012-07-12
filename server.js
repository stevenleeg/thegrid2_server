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
    console.log("[usr:" + connection.user.id + "] User connected");

    connection.on("message", function(message) {
        var msg = JSON.parse(message.utf8Data);
        EventManager.trigger(msg.e, connection.user, msg.data);
    });

    connection.on("close", function() {
        connection.user.remove();
    });
});

console.log("[srv] Server ready");
