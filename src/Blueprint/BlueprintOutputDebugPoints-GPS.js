/* globals window, _, VIZI, THREE */
(function() {
  "use strict";

/**
 * Blueprint debug points output
 * @author Robin Hawkes - vizicities.com
 */  

  // output: {
  //   type: "BlueprintOutputDebugPoints",
  //   options: {}
  // }
  VIZI.BlueprintOutputDebugPointsGPS = function(options) {
    var self = this;

    VIZI.BlueprintOutput.call(self, options);

    _.defaults(self.options, {
      name: "Debug points"
    });

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []}
    ];

    self.actions = [
      {name: "outputPoints", arguments: ["data"]}
    ];

    self.name = self.options.name;

    self.world;
  };

  VIZI.BlueprintOutputDebugPointsGPS.prototype = Object.create( VIZI.BlueprintOutput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintOutputDebugPointsGPS.prototype.init = function() {
    var self = this;

    self.emit("initialised");
  };

  // {
  //   coordinates: [lon, lat]
  // }
  VIZI.BlueprintOutputDebugPointsGPS.prototype.outputPoints = function(data) {
    var self = this;

    //gets an array of unique wireless network names
    var colorMap = _.uniq(data, false, function(d){
      return d.values[0];
    }).map(function(d){ return d.values[0];});

    console.log(colorMap);

    var colorScale = d3.scale.cubehelix()
        .domain([0, (colorMap.length/2), colorMap.length])
        .range([
          d3.hsl(-100, 0.75, 0.35),
          d3.hsl(  80, 1.50, 0.80),
          d3.hsl( 260, 0.75, 0.35)
        ]);

    var nestedData = d3.nest()
    .key(function(d) { return d.coordinates[0] + "," + d.coordinates[1]; })
    .entries(data);

   // console.log(nestedData);

    var barGeom = new THREE.BoxGeometry( 10, 1, 10 );

    // Shift each vertex by half the bar height
    // This means it will scale from the bottom rather than the centre
    var vertices = barGeom.vertices;
    for (var v = 0; v < vertices.length; v++) {
      vertices[v].y += 0.5;
    }

    _.each(nestedData, function(point) {
      //the data is nested on coordinates so we can just use the first value
      var coords = point.values[0].coordinates;
      var heightOffset = 0;

      for (var i = 0; i < (point.values.length); i++){//point.values.length; i++) {

       getIndex(colorMap, point.values[i].values[0]).then(function(colorIndex){
          
          //console.log("what", point.values[i].values[0], colorIndex);
          
          var material = new THREE.MeshBasicMaterial({
            color: colorScale(colorIndex),
            // vertexColors: THREE.VertexColors,
            // ambient: 0xffffff,
            // emissive: 0xcccccc,
            shading: THREE.FlatShading
          });

          var offset = new VIZI.Point();
          var geoCoord = self.world.project(new VIZI.LatLon(coords[1], coords[0]));

          offset.x = -1 * geoCoord.x;
          offset.y = -1 * geoCoord.y;

          //get height from strength
          var height = point.values[i].values[2]/4;

          //console.log("height", height);

          var mesh = new THREE.Mesh(barGeom, material);

          mesh.scale.y = height;

          // Offset
          mesh.position.x = -1 * offset.x;
          mesh.position.z = -1 * offset.y;
          mesh.position.y = heightOffset;

          heightOffset += height;

          // Flip as they are up-side down
          // mesh.rotation.x = 90 * Math.PI / 180;

          mesh.matrixAutoUpdate && mesh.updateMatrix();
          self.add(mesh);
        });
      }
    });
  };

  VIZI.BlueprintOutputDebugPointsGPS.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };

  function getIndex(array, name){
    var deferred = Q.defer();

    for (var i = 0; i < array.length; i++) {
      if (array[i] === name){
        deferred.resolve(i);
      }
    }

    return deferred.promise;
  }
}());