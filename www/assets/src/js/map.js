var map = null;

var hexBeehiveGenerator = {
    config: {
        defaultStepSize: 10,
        //1425 is equal to -st 10
        // stepSizeRadius: 160
        stepSizeRadius: 165
    },
    /**
     * Hexagon counter (used for featured ID)
     * @type int
     */
    counter: 0,
    /**
     * Feature which it's currently open in popup
     * @type ol.Feature
     */
    currentStepSizeFeature: null,
    /**
     * Current step size of all features (key = feature ID)
     * @type object
     */
    featureStepSize: {}

};
/**
 * Source which contains the hexagon features
 * @type {ol.source.Vector}
 */
hexBeehiveGenerator.hexagonSource = new ol.source.Vector();
/**
 * Hexagon layer
 * @type {ol.layer.Vector}
 */
hexBeehiveGenerator.hexagonLayer = new ol.layer.Vector({source: hexBeehiveGenerator.hexagonSource});

hexBeehiveGenerator.getNumberOfCircles = function (steps) {
    if (0 == steps) {
        return 0;
    }
    var circles = 1;
    for (var i = 1; i < steps; i++) {
        circles = circles + i * 6;
    }
    return circles;
};
/**
 *
 * @returns {number}
 */
hexBeehiveGenerator.getDefaultStepSize = function () {
    return this.config.defaultStepSize;
};
/**
 * Set default step size for new hexagon
 * @param stepSize
 */
hexBeehiveGenerator.setDefaultStepSize = function (stepSize) {
    var stepSizeInt = parseInt(stepSize);
    if (isNaN(stepSizeInt)) {
        alert(stepSize + " isn't a valid step size");
    } else {
        this.config.defaultStepSize = stepSizeInt;
    }
};

hexBeehiveGenerator.showConfig = function () {

};

/**
 * Asks user for default step size and sets it
 */
hexBeehiveGenerator.setDefaultStepSizePrompt = function () {
    var defaultStepSize = prompt('Default step size:', "" + this.getDefaultStepSize());
    this.setDefaultStepSize(defaultStepSize);
};

/**
 * Make hexagons selectable on hover
 * @type {ol.interaction.Select}
 */
var select = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    layers: [hexBeehiveGenerator.hexagonLayer]
});

/**
 * Allow drag
 * @type {ol.interaction.Translate}
 */
var translate = new ol.interaction.Translate({
    features: select.getFeatures()
});

/**
 * Create map
 */
hexBeehiveGenerator.createMap = function () {
    /**
     * @type {ol.Map}
     */
    map = new ol.Map({
        interactions: ol.interaction.defaults().extend([select, translate]),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            hexBeehiveGenerator.hexagonLayer
        ],
        target: 'map',
        controls: ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }),
        view: new ol.View({center: ol.proj.fromLonLat([0, 0]), zoom: 2}),
        overlays: [overlay]
    });

    //Get current position
    var geoLocation = new ol.Geolocation({tracking: false});
    geoLocation.on('change:position', function () {
        geoLocation.setTracking(false);
        var coordinate = geoLocation.getPosition();
        map.getView().setCenter(ol.proj.fromLonLat(coordinate));
        map.getView().setZoom(15);
    });
};

/**
 * Generate a hexagon with size steps and center on coordinates
 * @param coordinates
 * @param steps
 * @param lonLat
 * @returns {ol.geom.Polygon.fromCircle}
 */
hexBeehiveGenerator.getHexagon = function (coordinates, steps, lonLat) {
    if (lonLat) {
        coordinates = ol.proj.fromLonLat(coordinates);
    }

    var radius = (steps * this.config.stepSizeRadius) / ol.proj.METERS_PER_UNIT.m;
    console.log(ol.proj.METERS_PER_UNIT.m);
    console.log(radius);
    var circle = new ol.geom.Circle(coordinates, radius);
    // console.log(circle);
    var hexagon1 = new ol.geom.Polygon.fromCircle(circle, 1000);
    var hexagon2 = new ol.geom.Polygon.circular(new ol.Sphere(6378137), circle.getCenter(), circle.getRadius(), 6);
    console.log(hexagon1);
    console.log(hexagon2);
    return hexagon1;
};

/**
 * Add a polygon to the current layer
 * @param polygon
 * @param steps
 */
hexBeehiveGenerator.addPolygon = function (polygon, steps) {
    console.log(polygon);
    var feature = new ol.Feature(polygon);
    feature.setId(hexBeehiveGenerator.counter);
    hexBeehiveGenerator.counter++;
    hexBeehiveGenerator.featureStepSize[feature.getId()] = steps;
    this.hexagonSource.addFeature(feature);
};

/**
 * Draw a hexagon with size steps and center on coordinates
 * @param coordinates
 * @param steps
 * @param lonLat
 */
hexBeehiveGenerator.drawHexagon = function (coordinates, steps, lonLat) {
    this.addPolygon(this.getHexagon(coordinates, steps, lonLat), steps);
};

/**
 * Print PokemonGo-Map command line (Just a simple version)
 */
hexBeehiveGenerator.printCommandLine = function () {
    var features = hexBeehiveGenerator.hexagonSource.getFeatures();
    var promises = [];
    if (features && features.length) {
        var featuresLength = features.length;
        var addressCommandLine = '';
        var coordinateCommandLine = '';
        for (var i = 0; i < featuresLength; i++) {
            var feature = features[i];
            var extent = feature.getGeometry().getExtent();
            var center = ol.extent.getCenter(extent);
            center = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
            var steps = hexBeehiveGenerator.featureStepSize[feature.getId()];
            coordinateCommandLine += '-st ' + steps + ' -l "' + center[1] + ',' + center[0] + '"<br>';

            var promise = photon.getAddress(center[1], center[0]);
            promises.push(promise);
            (function (promise, steps) {
                console.log("Called");
                promise.then(function (address) {
                    console.log(address);
                    addressCommandLine += '-st ' + steps + ' -l "' + address + '"<br>';
                });
            })(promise, steps);
        }

        //Show loading icon
        modalView.showLoadingIcon("Command line");
        var html = '';
        html += '<h2>Command line with coordinates</h2>';
        html += coordinateCommandLine;
        html += '<h2>Command line with address</h2>';

        $.when.apply($, promises)
            .then(function () {
                html += addressCommandLine;
            }, function () {
                html += "Couldn't get address of coordinates.";
            })
            .always(function () {
                modalView.show('Command line', html);
            });
    } else {
        alert("There's nothing to print (No hexagon added?)");
    }
};

/**
 * Show popup for feature at evt.pixel
 * @param evt
 */
hexBeehiveGenerator.showPopup = function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        stepSizeInput.value = hexBeehiveGenerator.featureStepSize[feature.getId()];
        currentStepSize.innerHTML = stepSizeInput.value;
        overlay.setPosition(evt.coordinate);
        hexBeehiveGenerator.currentStepSizeFeature = feature;
        return true;
    });
};

hexBeehiveGenerator.importSettings = function () {
    var exportString = prompt('Enter export string', '');
    var exportObject = JSON.parse(exportString);
    if (!exportObject.features.length) {
        modalView.show('No features found', 'Import data:<br>' + exportString);
        return false;
    }

    this.counter = exportObject.counter;
    this.featureStepSize = exportObject.featureStepSize;
    //Reset hexagons
    this.hexagonSource = new ol.source.Vector();
    this.hexagonLayer.setSource(this.hexagonSource);
    for (var i = 0; i < exportObject.features.length; i++) {
        var polygon = new ol.geom.Polygon();
        polygon.setCoordinates(exportObject.features[i].coordinates);

        var feature = new ol.Feature(polygon);
        feature.setId(exportObject.features[i].id);
        this.hexagonSource.addFeature(feature);
    }
    // Zoom to import
    var extent = this.hexagonSource.getExtent();
    map.getView().fit(extent, map.getSize());


    return true;
};

hexBeehiveGenerator.exportSettings = function () {
    var currentFeatures = this.hexagonSource.getFeatures();
    if (!currentFeatures.length) {
        modalView.show('No hexagon found', 'nothing to export');
        return true;
    }
    var features = [];
    for (var i = 0; i < currentFeatures.length; i++) {
        var hexagon = {
            id: currentFeatures[i].getId(),
            coordinates: currentFeatures[i].getGeometry().getCoordinates()
        };

        features.push(hexagon);
    }

    var exportString = JSON.stringify({
        features: features,
        featureStepSize: this.featureStepSize,
        counter: this.counter
    });
    modalView.show('Export data', exportString);
    return true;
};

//Create map
hexBeehiveGenerator.createMap();
//Add popup event handler
map.on('singleclick', hexBeehiveGenerator.showPopup);
//Add context menu
map.addControl(contextMenu);

//Get events from navbar
$('.navbar').find('a').on('click', function (e) {
    e.preventDefault();
    var target = $.trim($(this).data('target'));
    if (target) {
        switch (target) {
            case 'showHelp':
                var modalHelp = $('#modal-help');
                var title = modalHelp.find('#help-title').html();
                var body = modalHelp.find('#help-body').html();

                modalView.show(title, body);
                break;
            case 'showContact':
                var modalContact = $('#modal-contact');
                modalView.show(modalContact.find('#modal-contact-title').html(), modalContact.find('#modal-contact-body').html());
                break;

            default:
                if (hexBeehiveGenerator.hasOwnProperty(target)) {
                    hexBeehiveGenerator[target]();
                } else {
                    modalView.show("Error", "Couldn't find function " + target);
                }
        }
    }
});