var WebSocketClient = require("websocket").client;

var client = new WebSocketClient();
var callback;

process.stdin.resume();
process.stdin.setEncoding("utf8");

var Commands = (function() {
    function ping(send) {
        send({
            e: "g.ping"
        });
    }

    function getMaps(send) {
        send({
            e: "m.getMaps"
        });
    }

    return {
        ping: ping,
        getMaps: getMaps
    }
})();

client.on("connect", function(connection) {
    console.log("Connected.");

    connection.on('message', function(message) {
        console.log("Recieved: " + message.utf8Data);
    });

    function send(data) {
        console.log("Sending event: " + data.e);
        connection.sendUTF(JSON.stringify(data));
    }
    
    process.stdin.on("data", function(chunk) {
        chunk = chunk.replace(/\s+$/, '');

        if(Commands[chunk] == undefined)
            return console.log("Invalid test: " + chunk);
        
        Commands[chunk](send);
    });
});

client.connect("ws://localhost:8080/", "grid-1.0");
