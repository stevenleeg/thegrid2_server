var WebSocketClient = require("websocket").client;

var client = new WebSocketClient();
var callback;

process.stdin.resume();
process.stdin.setEncoding("utf8");

function attempt_connect() {
    console.log("Connecting...");
    client.connect("ws://localhost:8080/", "grid-1.0");
};

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

    function getGrids(send) {
        send({
            e: "m.getGrids"
        });
    }

    return {
        ping: ping,
        getMaps: getMaps,
        getGrids: getGrids
    }
})();

client.on("connect", function(connection) {
    console.log("Connected!");

    connection.on('message', function(message) {
        // Make it look pretty.
        var data = JSON.parse(message.utf8Data);
        data = JSON.stringify(data, null, 3);
        console.log("Recieved object:\n " + data);
        process.stdout.write(">> ");
    });

    connection.on("close", function() {
        console.log("Connection closed! Attempting to reopen...");
        setTimeout(attempt_connect, 1000);
    });

    function send(data) {
        console.log("Sending event: " + data.e);
        connection.sendUTF(JSON.stringify(data));
    }
    
    process.stdout.write(">> ");
    process.stdin.on("data", function(chunk) {
        chunk = chunk.replace(/\s+$/, '');

        if(Commands[chunk] == undefined) {
            if(chunk == " ")
                console.log("Invalid test: " + chunk);
            process.stdout.write(">> ");
            return;
        }
        
        Commands[chunk](send);
    });
});

client.on("connectFailed", function(error) {
    console.log("Failed! Retrying in 3 seconds");
    setTimeout(attempt_connect, 3000);
});

attempt_connect();
