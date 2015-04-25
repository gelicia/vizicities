/* globals window, _, VIZI, d3, Papa */
(function() {
  "use strict";

/**
 * Blueprint CSV input
 * @author Robin Hawkes - vizicities.com
 */  

  // input: {
  //   type: "BlueprintInputCSV",
  //   options: {
  //     path: "/data/sample.csv"
  //   }
  // }

  VIZI.BlueprintInputCSV = function(options) {
    var self = this;

    VIZI.BlueprintInput.call(self, options);

    _.defaults(self.options, {});

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []},
      {name: "dataReceived", arguments: ["csv"]},
    ];

    self.actions = [
      {name: "requestData", arguments: []},
    ];
  };

  VIZI.BlueprintInputCSV.prototype = Object.create( VIZI.BlueprintInput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintInputCSV.prototype.init = function() {
    var self = this;
    self.emit("initialised");
  };

  // TODO: Pull from cache if available
  VIZI.BlueprintInputCSV.prototype.requestData = function() {
    var self = this;

    if (!self.options.path) {
      throw new Error("Required path option missing");
    }

    // Request data
    d3.text(self.options.path, function(error, data) {
      if (error) {
        if (VIZI.DEBUG) console.log("Failed to request CSV data");
        console.warn(error);
        return;
      }

      var results = Papa.parse(data, {
        header: true,
        complete: function(results) {
          self.emit("dataReceived", {data: results.data});
        }
      });
    });
  };
}());