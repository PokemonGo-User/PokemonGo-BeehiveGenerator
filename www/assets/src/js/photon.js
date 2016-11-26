var photon = {};

photon.getAddress = function (lat, lon) {
    var deferred = $.Deferred();

    var promise = this.sendRequest("reverse", {lat: lat, lon: lon});
    promise.then(function (data) {
        if (data !== null && data.hasOwnProperty("features") && $.isArray(data.features)) {
            var entry = data.features[0];
            var properties = entry.properties;
            var address = "";
            if (properties.hasOwnProperty("street")) {
                address += properties.street;
                if (properties.hasOwnProperty("housenumber")) {
                    address += " " + properties.housenumber;
                }
            } else if (properties.hasOwnProperty("name")) {
                address += properties.name;
            }

            address += ", " + properties.postcode + " " + properties.city + ", " + properties.country;
            deferred.resolve(address);
        }
    });
    return deferred.promise();
};

photon.getCoordinates = function (address) {
    //TODO Implement
};


photon.sendRequest = function (urlPath, data) {
    return $.ajax({
        url: "//photon.komoot.de/" + urlPath,
        cache: false,
        data: data,
        timeout: 15000,
        dataType: "json"
    });
};