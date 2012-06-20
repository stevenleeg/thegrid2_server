var WebSocketServer = require("websocket").server;
var Express = require("express");
var User = require("./model/user").User;

var app = Express.createServer();
app.listen(8080);

var srv = new WebSocketServer({
    httpServer: app
});

srv.on("request", function(req) {
    try {
        var connection = req.accept("grid-1.0", req.origin);
    } catch(e) {
        request.reject();
        return;
    }
    connection.user = new User(connection);
    console.log("[usr:" + connection.user.id + "] User connected");

    connection.on("message", function(message) {
        console.log("[usr:" + connection.user.id + "] Called: " + JSON.parse(message.utf8Data)['f']);
        connection.user.on_message(message);
    });
    connection.on("close", function() {
        console.log("[usr:" + connection.user.id + "] User disconnected");
        connection.user.remove();
    });
});

console.log("[srv] Server ready");
