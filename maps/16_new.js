var MapHelper = require("../maphelper.js").MapHelper;

exports.Map = function(grid) {
    // Basic properties
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
            }
        });
    }
    // Events object
    this.events = {
        init: this.init
    }
}
