var WebSocketServer = require("websocket").server;
var http = require("http");

var User = require("./model/user").User;
var Grid = require("./model/grid").Grid;
var EventManager = require("./utility/eventmanager").EventManager;
var UserEvents = require("./utility/events").UserEvents;
var Periodical = require("./utility/periodical").Periodical;

var server = http.createServer(function(req, resp) {
    resp.writeHead(404);
    resp.end();
});
server.listen(8080, function() {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Just a server!")
    console.log("[srv] Server ready");   
});

var srv = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var DEBUG = true;

// Load general events

srv.on("request", function(req) {
    try {
        var connection = req.accept("grid-1.0", req.origin);
    } catch(e) {
        console.log("[svr] Rejecting connection");
        req.reject();
        return;
    }
    connection.user = new User(connection);

    // Load all default listeners
    for(var i in UserEvents) {
        connection.user.on(i, UserEvents[i]);
    }

    connection.on("message", function(message) {
        var msg = JSON.parse(message.utf8Data);
        connection.user.emit(msg.e, connection.user, msg.data);
    });

    connection.on("close", function() {
        connection.user.remove();
    });
});

var periodical = new Periodical();

if(DEBUG) {
    var grid = new Grid("test", "16_new");
    grid.active = true;
}
