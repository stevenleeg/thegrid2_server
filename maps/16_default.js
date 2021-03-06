exports.map = {
	"maxPlayers": 4,
	"autogenerate": 1,
	"tlim": 100,
	"init_tused": 3,
	"init_tlim": 6,
	"init_cash": 500,
    "size": 16,

    "colors": {
        0: "#FEBE07",
        1: "#10A1FF",
        2: "#FF401C",
        3: "#3FCD45"
    },

	"coords": {
		"1_1": {
			"type": 2,
			"health": 100,
			"player": 1
		},
		"1_0": {
			"type": 1,
			"health": 25,
			"player": 1
		},
		"0_1": {
			"type": 1,
			"health": 25,
			"player": 1
		},

		"14_0": {
			"type": 1,
			"health": 25,
			"player": 2
		},
		"15_1": {
			"type": 1,
			"health": 25,
			"player": 2
		},
		"14_1": {
			"type": 2,
			"health": 100,
			"player": 2
		}
	},

	"events": {
		//"init": ["0_0", "15_0"],
		//"join_0": ["1_1", "1_0", "0_1"],
		//"join_1": ["14_0", "15_1", "14_1"],
        init: function(grid, UpdateManager) {
        }
	}
}
