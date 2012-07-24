var Grid = require("../model/grid").Grid;
/*
 * This class manages the periodical functions that need to be called
 */
exports.Periodical = function() {
    var self = this;

    self.gridEmit = function(event, data) {
        for(var i in Grid.store) {
            Grid.store[i].emit(event, data);
        }
    }

    self.emitIncome = function() {
        self.gridEmit("addIncome");
    }

    self.emitInfector = function() {
        self.gridEmit("infect");
    }
    
    self.int_emit_income = setInterval(self.emitIncome, 1000);
    self.int_emit_infector = setInterval(self.emitInfector, 1000);
}
