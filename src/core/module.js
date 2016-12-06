function RoAModule(name) {
    this.name = name;
}

RoAModule.prototype = {
    name: "NO_NAME",
    loaded: false,
    load: function () {
        this.loaded = true;

        var loadString = "Loaded Module " + this.name;

        if(modules.logger) {
            modules.logger.log(loadString);
        } else {
            console.log(loadString);
        }
    }
};

Object.spawn = function (parent, props) {
    var defs = {}, key;
    for (key in props) {
        if (props.hasOwnProperty(key)) {
            defs[key] = {value: props[key], enumerable: true, configurable: true, writable: true};
        }
    }
    return Object.create(parent, defs);
};