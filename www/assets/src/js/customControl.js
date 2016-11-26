window.customControl = {};
var customControl = window.customControl;

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
customControl.addHexagon = function (opt_options) {
    var options = opt_options || {};

    var button = document.createElement('button');
    button.innerHTML = 'A';

    var addHexagon = function () {
        hexBeehiveGenerator.drawHexagon([11.274291, 47.256252], 10, true);
    };

    button.addEventListener('click', addHexagon, false);
    button.addEventListener('touchstart', addHexagon, false);

    var element = document.createElement('div');
    element.className = 'add-hexagon ol-unselectable ol-control';
    element.appendChild(button);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};
ol.inherits(customControl.addHexagon, ol.control.Control);

customControl.printCommandLine = function (opt_options) {
    var options = opt_options || {};

    var button = document.createElement('button');
    button.innerHTML = 'P';

    button.addEventListener('click', hexBeehiveGenerator.printCommandLine, false);
    button.addEventListener('touchstart', hexBeehiveGenerator.printCommandLine, false);

    var element = document.createElement('div');
    element.className = 'print-coordinates ol-unselectable ol-control';
    element.appendChild(button);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};
ol.inherits(customControl.printCommandLine, ol.control.Control);
