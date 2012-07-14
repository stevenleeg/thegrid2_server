var MapHelper = require("../utility/maps.js").MapHelper;

exports.Map = function(grid) {
    // Basic properties
    this.name = "Sixteen";
    this.maxPlayers = 4;
    this.autoGenerate = 1;
    this.tlim = 100;
    this.init_tused = 3;
    this.init_tlim = 6;
    this.init_cash = 500;
    this.size = 16;
    this.grid = grid;

    this.colors = {
        0: "#FEBE07",
        1: "#10A1FF",
        2: "#FF401C",
        3: "#3FCD45"
    };

    this.init = function(grid, args) {
        grid.bulkModify({
            "0_0": {
                type: 99
            },
            "15_0": {
                type: 99
            },
            "0_15": {
                type: 99
            },
            "15_15": {
                type: 99
            }
        });
    }

    this.join_0 = function(grid, args) {
        MapHelper.bulkUpdate(grid, {
            "1_1": {
                type: 2,
                health: 100,
                player: 0
            },
            "1_0": {
                type: 1,
                health: 25,
                player: 0
            },
            "0_1": {
                type: 1,
                health: 25,
                player: 0
            }
        });
    }

    this.join_1 = function(grid, args) {
        MapHelper.bulkUpdate(grid, {
            "14_0": {
                type: 1,
                health: 25,
                player: 1
            },
            "15_1": {
                type: 1,
                health: 25,
                player: 1
            },
            "14_1": {
                type: 2,
                health: 100,
                player: 1
            }
        });
    }
    // Events object
    this.events = {
        init: this.init,
        "join_0": this.join_0,
        "join_1": this.join_1
    }
}
