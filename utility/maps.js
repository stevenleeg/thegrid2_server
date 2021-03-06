// A list of maps!
exports.Maps = {
    0: "16_new",
}

exports.MapHelper = (function() {
    //
    // Applies a bulk update operation to a grid
    // and then uses UpdateManager to propagate
    // the changes to any players.
    //
    var bulkUpdate = function(grid, coords) {
        grid.bulkModify(coords);
        
        for(var key in coords) {
            var coord = grid.getCoord(key);
            UpdateManager.sendCoord(coord);
        }

        return true;
    }

    return {
        "bulkUpdate": bulkUpdate
    }
})();
