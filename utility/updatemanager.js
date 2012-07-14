var User = require("../model/user").User;

exports.UpdateManager = (function() {
    //
    // Sends to a single user
    //
    var sendUser = function(user, func, args) {
        user.call(func, args);
    }

    //
    // Sends to all users in a grid
    //
    var sendGrid = function(grid, func, args, exclude) {
        for(var i in grid.users) {
            if(grid.users[i] == exclude) continue;
            grid.users[i].call(func, args);
        }
    }

    //
    // Sends a coordinate to its grid
    //
    var sendCoord = function(coord, exclude) {
        sendGrid(coord.grid, "set", {
            coord: coord.toString(),
            tile: coord.type,
            player: coord.player.id,
            health: coord.health
        }, exclude)
    }

    return {
        sendUser: sendUser,
        sendGrid: sendGrid,
        sendCoord: sendCoord
    }
})();
