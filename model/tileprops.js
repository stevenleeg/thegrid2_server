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
            // TODO: Check to make sure they're placing around territory
            user.send("g.updateTlim")
            // Make sure they have enough territory
            if(user.player.tused >= user.player.tlim)
                return false;
            // Add to tused
            user.player.tused++;
            user.send("g.setTerritory", {
                tused: user.player.tused,
                tlim: user.player.tlim
            });
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
            // CHECK FOR MINES
            return true;
        }
    },

    // Infector
    4: {
        health: 25,
        price: 50,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // House
    5: {
        health: 50,
        price: 50,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // Damager
    6: {
        health: 50,
        price: 200,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // Wall
    7: {
        health: 50,
        price: 100,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // Defender
    8: {
        health: 25,
        price: 25,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // Shield
    9: {
        health: 25,
        price: 200,
        place: function(grid, coord, user) {
            return true;
        }
    },

    // Cannon
    10: {
        health: 50,
        price: 200,
        place: function(grid, coord, user) {
            return true;
        }
    }
};
