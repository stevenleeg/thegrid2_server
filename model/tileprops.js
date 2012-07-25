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
var default_check = function(coord, user) {
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
        damage: false, // Whether or not it can be hit by a damager

        // The place check. This is called whenever a 
        // user attempts to place the tile. The function's
        // job is to determine whether or not the user is
        // allowed to place the tile (returning true/false)
        placeTest: function(coord, user) {
            // Make sure there's territory around
            if(!coord.inRangeOf(1, user.player.id) || coord.exists()) return false;
            // Make sure they have enough territory
            if(user.player.tused >= user.player.tlim)
                return false;

            return true;
        },
        // The onPlace event is called after a tile has been placed.
        // Its job is to perform any additional tasks
        onPlace: function(coord, user) {
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
        placeTest: function() { return false; },
        damage: true
    },

    // Miner
    3: {
        health: 50,
        price: 100,
        damage: true,
        placeTest: function(coord, user) {
            // Make sure they're in range of a mine
            if(!coord.inRangeOf(99) || !coord.player == user.player.id)
                return false;
            
            return true;
        },
        onPlace: function(coord, user) {
            // Increase their income
            user.player.inc += 5;
            user.send("g.setIncome", {
                income: user.player.inc
            });
        }
    },

    // Infector
    4: {
        health: 25,
        price: 50,
        damage: true,
        placeTest: default_check,
        onPlace: function(coord, user) {
            coord.time = Math.round(new Date().getTime() / 1000);
            coord.grid.infectors.push(coord);
        }
    },

    // House
    5: {
        health: 50,
        price: 50,
        damage: true,
        placeTest: default_check,
        place: function(coord, user) {
            user.player.tlim += 4;
            if(user.player.tlm > coord.grid.map.tlim)
                user.player.tlim = coord.grid.map.tlim;

            user.send("g.setTerritory", {
                tuser: user.player.tused,
                tlim: user.player.tlim
            });
        }
    },

    // Damager
    6: {
        health: 50,
        price: 200,
        damage: true,
        placeTest: default_check,
        onPlace: function(coord, user) {
            coord.grid.damagers.push(coord);
        }
    },

    // Wall
    7: {
        health: 50,
        price: 100,
        damage: true,
        placeTest: default_check
    },

    // Defender
    8: {
        health: 25,
        price: 25,
        damage: true,
        placeTest: default_check,
    },

    // Shield
    9: {
        health: 25,
        price: 200,
        damage:true,
        placeTest: default_check
    },

    // Cannon
    10: {
        health: 50,
        price: 200,
        damage: true,
        placeTest: default_check
    }
};
