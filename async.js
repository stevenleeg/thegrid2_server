var User = require("./model/user").User;
var Grid = require("./model/grid").Grid;
var UpdateManager = require("./updatemanager").UpdateManager;

exports.Async = (function() {
    var ping = function(user, args) {
        return { 
            "status": 200,
            "msg": args['msg']
        };
    }

    //
    // Gets a list of grids on the server
    //
    var getGrids = function(user, args) {
        var grids = [];
        for(var i in Grid.store) {
            var grid = Grid.store[i];
            grids.push({
                gid: grid.id,
                name: grid.name,
                size: grid.map.size,
                active: grid.active,
                players: grid.num_users
            });
        }
        return {
            "status": 200,
            "grids": grids
        };
    }

    //
    // Creates a grid from a name and a map
    //
    var createGrid = function(user, args) {
        var grid;
        var name = args['name'];
        var map = args['map'];

        if(name.length == 0 || map.length == 0)
            return { status: 406, error: "name" };
        
        if(Grid.names.indexOf(name) != -1)
            return { status: 406, error: "Name taken" };

        grid = new Grid(name, map);
        // TODO: Update nogrids on the new grid!
        return { status: 200, gid: grid.id };
    }

    //
    // Joins a room (basically an inactive grid sitting
    // in the waiting room)
    //
    var joinRoom = function(user, args) {
        var pid, active, grid;

        grid = Grid.store[args['gid']];
        if(grid == undefined)
            return {status: 404, error: "Grid not found."};

        pid = grid.addUser(user, args['pid']);
        if(pid == -1)
            return {status: 406, error: "Grid is full"}

        user.pid = pid;
        user.grid = grid;
        user.active = true;

        active = [];
        for(var i in grid.users) {
            active.push(grid.users[i].pid);
        }

        // Notify everyone else
        UpdateManager.sendGrid(grid, "addPlayer", { pid: pid }, user);

        return { 
            status: 200,
            pid: pid,
            active: active,
            colors: grid.map.colors,
            size: grid.map.size
        };
    }

    var joinGrid = function(user, args) {
        var grid, pid, active;

        grid = Grid.store[args['gid']];
        if(grid == undefined)
            return { status: 406, error: "no gid" };

        pid = grid.addUser(user, args['pid']);
        if(pid == -1)
            return {status: 406, error: "Grid is full"};
        
        user.pid = pid;
        user.grid = grid;
        user.active = true;
        
        if(grid.player_data[pid] == undefined) {
            grid.player_data[pid] = user.player = {};
            user.player['cash'] = grid.map.init_cash;
            user.player['inc'] = 0;
            user.player['lastInc'] = new Date();
            user.player['tused'] = grid.map.init_tused;
            user.player['tlim'] = grid.map.init_tlim;

            // Trigger a join event on the grid
            grid.trigger("join_" + pid);
        }

        // Announce a new player!
        UpdateManager.sendGrid(grid, "addPlayer", { pid: pid}, user);
        
        // Get a list of active players
        active = [];
        for(var i in grid.users) {
            active.push(grid.users[i].pid);
        }

        return {
            status: 200,
            size: grid.map.size,
            active: active,
            uid: user.id,
            pid: pid,
            cash: user.player.cash,
            inc: user.player.inc,
            tused: user.player.tused,
            tlim: user.player.tlim,
            colors: grid.map.colors,
            coords: grid.dump()
        }
    }

    var startGame = function(user, args) {
        var grid;

        grid = user.grid;
        grid.active = true;
        UpdateManager.sendGrid(grid, "startGame");

        return { status: 200 };
    }

    return {
        ping: ping,
        getGrids: getGrids,
        createGrid: createGrid,
        joinRoom: joinRoom,
        joinGrid: joinGrid,
        startGame: startGame
    };
})();
