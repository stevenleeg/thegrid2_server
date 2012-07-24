var UpdateManager = require("../utility/updatemanager").UpdateManager;

//
// This object contains the properties of every tile
// available in the game. It also includes functions
// to be run on various events such as on placement
// (which will return true/false based on whether or
// not the placement should be allowed to occur) or
// on destroy.
//
// The first tile (territory) has been documented to
// display most of the features of this object.
//
var default_check = function(grid, coord, user) {
    if(coord.player == user.player.id && coord.type == 1) return true;
    else return false;
}

exports.TileProps = {
    // Territory
    1: {
        // Set some basic properties
        health: 25,
        price: 25,
        override: false, // This type can NOT be placed over existing tiles

        // The place event. This is called whenever a 
        // user attempts to place the tile. The function's
        // job is to determine whether or not the user is
        // even allowed to place the tile (returning true/false)
        // in addition to doing anything necessary upon placing
        // the tile.
        place: function(grid, coord, user) {
            // Make sure there's territory around
            if(!coord.inRangeOf(1, user.player.id) || coord.exists()) return false;
            // Make sure they have enough territory
            if(user.player.tused >= user.player.tlim)
                return false;
            // Add to tused
            user.player.tused++;
            user.send("g.setTerritory", {
                tused: user.player.tused,
                tlim: user.player.tlim
            });

            return true;
        }
    },
    
    // Headquarters
    2: {
        health: 100,
        price: 100,
        place: function(grid, coord, user) {
            return false;
        }
    },

    // Miner
    3: {
        health: 50,
        price: 100,
        place: function(grid, coord, user) {
            // Make sure they're in range of a mine
            if(!coord.inRangeOf(99) || !coord.player == user.player.id)
                return false;
            
            // Increase their income
            user.player.inc += 5;
            user.send("g.setIncome", {
                income: user.player.inc
            });

            return true;
        }
    },

    // Infector
    4: {
        health: 25,
        price: 50,
        place: default_check
    },

    // House
    5: {
        health: 50,
        price: 50,
        place: function(grid, coord, user) {
            if(!default_check(grid, coord, user)) return false;

            user.player.tlim += 4;
            if(user.player.tlm > grid.map.tlim)
                user.player.tlim = grid.map.tlim;

            user.send("g.setTerritory", {
                tuser: user.player.tused,
                tlim: user.player.tlim
            });

            return true;
        }
    },

    // Damager
    6: {
        health: 50,
        price: 200,
        place: default_check
    },

    // Wall
    7: {
        health: 50,
        price: 100,
        place: default_check
    },

    // Defender
    8: {
        health: 25,
        price: 25,
        place: default_check
    },

    // Shield
    9: {
        health: 25,
        price: 200,
        place: default_check
    },

    // Cannon
    10: {
        health: 50,
        price: 200,
        place: default_check
    }
};
