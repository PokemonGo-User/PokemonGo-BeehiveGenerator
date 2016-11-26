/**
 * Elements that make up the popup.
 */
var container = document.getElementById('popup');
var closer = document.getElementById('popup-closer');
var stepSizeInput = document.getElementById('step-size');
var currentStepSize = document.getElementById('current-step-size');

stepSizeInput.addEventListener('input', function () {
    var stepSize = stepSizeInput.value;
    var feature = hexBeehiveGenerator.currentStepSizeFeature;
    var extent = feature.getGeometry().getExtent();
    var center = ol.extent.getCenter(extent);
    var hexagon = hexBeehiveGenerator.getHexagon(center, stepSize);
    hexBeehiveGenerator.featureStepSize[feature.getId()] = stepSize;
    feature.setGeometry(hexagon);
});

/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
}));


/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};