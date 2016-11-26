var contextMenuDefaultItems = [
    {
        text: 'Add hexagon',
        callback: function () {
            hexBeehiveGenerator.drawHexagon(map.getView().getCenter(), hexBeehiveGenerator.getDefaultStepSize());
        }
    },
    {
        text: 'Set default step size',
        callback: function () {
            hexBeehiveGenerator.setDefaultStepSizePrompt();
        }
    },
    {
        text: 'Print command line',
        callback: function () {
            hexBeehiveGenerator.printCommandLine();
        }
    },
    {
        text: 'Export hexagons',
        callback: function () {
            hexBeehiveGenerator.exportSettings();
        }
    },
    {
        text: 'Import hexagons',
        callback: function () {
            hexBeehiveGenerator.importSettings();
        }
    }
];

var contextMenu = new ContextMenu({
    width: 250,
    default_items: false,
    items: contextMenuDefaultItems
});


var contextMenuUtility = {};

contextMenuUtility.onHexagon = {
    restore: false,
    init: function () {
        var self = this;
        contextMenu.on('open', function (evt) {
            self.onOpen(evt);
        });
    },
    onOpen: function (evt) {
        //Add remove hexagon if there's one at this position
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (ft, l) {
            return ft;
        });
        if (feature) {
            contextMenu.clear();
            contextMenu.extend(contextMenuDefaultItems);
            var data = {feature: feature, event: evt, coordinate: evt.coordinate};
            var items = [
                '-', // this is a separator
                {
                    text: 'Set step size',
                    callback: this.stepSize,
                    data: data
                },
                {
                    text: 'Remove hexagon',
                    callback: this.remove,
                    data: data
                }
            ];
            contextMenu.extend(items);
            this.restore = true;
        } else if (this.restore) {
            contextMenu.clear();
            contextMenu.extend(contextMenuDefaultItems);
            this.restore = false;
        }
    },
    stepSize: function (obj) {
        hexBeehiveGenerator.showPopup(obj.data.event);
    },
    remove: function (obj) {
        hexBeehiveGenerator.hexagonSource.removeFeature(obj.data.feature);
    }
};
contextMenuUtility.onHexagon.init();