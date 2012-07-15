var EventManager = function() {
    this.events = {};
    /*
     * Registers a callback to an event
     */
    this.on = function(event, callback) {
        if(this.events[event] == undefined) this.events[event] = [];
        this.events[event].push(callback);
    }

    /*
     * Removes a callback from an event
     */
    this.off = function(event, callback) {
        if(this.events[event] == undefined) return;

        var index = this.events[event].indexOf(callback);
        if(index == -1) return;

        this.events[event].splice(index, 1);
    }

    /*
     * Triggers an event with context data
     */
    this.trigger = function(event, user, data) {
        var callbacks = this.events[event];

        for(var i in callbacks) {
            callbacks[i](user, data);
        }
    }

    // Create an event for the client subscribing to an event
    var that = this;
    this.on("r.sub", function(user, data) {
         that.on(data.e, function(other_user, other_data) {
            user.trigger(data.e, other_data);
         });
    });
};

exports.EventManager = new EventManager();
