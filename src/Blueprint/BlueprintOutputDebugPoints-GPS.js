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

   // console.log(data);

    var nestedData = d3.nest()
    .key(function(d) { return d.coordinates[0] + "," + d.coordinates[1]; })
    .entries(data);

    console.log(nestedData);

    var material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      // vertexColors: THREE.VertexColors,
      // ambient: 0xffffff,
      // emissive: 0xcccccc,
      shading: THREE.FlatShading
    });

    var barGeom = new THREE.BoxGeometry( 10, 1, 10 );

    // Shift each vertex by half the bar height
    // This means it will scale from the bottom rather than the centre
    var vertices = barGeom.vertices;
    for (var v = 0; v < vertices.length; v++) {
      vertices[v].y += 0.5;
    }

    var combinedGeom = new THREE.Geometry();

    _.each(nestedData, function(point) {
      //the data is nested on coordinates so we can just use the first value
      var coords = point.values[0].coordinates;
      var colors = d3.scale.category20c();

      for (var i = 0; i < point.values.length; i++) {
        var offset = new VIZI.Point();
        var geoCoord = self.world.project(new VIZI.LatLon(coords[1], coords[0]));

        offset.x = -1 * geoCoord.x;
        offset.y = -1 * geoCoord.y;

        // TODO: Get this from options

        //get height from strength
        var height = point.values[i].values[2]/4;

        var mesh = new THREE.Mesh(barGeom);

        mesh.scale.y = height * (i+1);

        // Offset
        mesh.position.x = -1 * offset.x;
        mesh.position.z = -1 * offset.y;

        // Flip as they are up-side down
        // mesh.rotation.x = 90 * Math.PI / 180;

        mesh.matrixAutoUpdate && mesh.updateMatrix();
        combinedGeom.merge(mesh.geometry, mesh.matrix);
      };
    });

    // Move merged geom to 0,0 and return offset
    var offset = combinedGeom.center();

    var combinedMesh = new THREE.Mesh(combinedGeom, material);

    // Use previously calculated offset to return merged mesh to correct position
    // This allows frustum culling to work correctly
    combinedMesh.position.x = -1 * offset.x;

    // Removed for scale center to be correct
    // Offset with applyMatrix above
    combinedMesh.position.y = -1 * offset.y;

    combinedMesh.position.z = -1 * offset.z;

    self.add(combinedMesh);
  };

  VIZI.BlueprintOutputDebugPointsGPS.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };
}());