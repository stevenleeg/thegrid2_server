var Grid = require("../model/grid").Grid;
/*
 * This class manages the periodical functions that need to be called
 */
exports.Periodical = function() {
    var self = this;

    self.emitIncome = function() {
        for(var i in Grid.store) {
            Grid.store[i].emit("addIncome");
        }
    }

    self.int_emit_income = setInterval(self.emitIncome, 1000);
}
