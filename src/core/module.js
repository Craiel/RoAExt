function RoAModule(name) {
    this.name = name;
    this.dependencies = [];
}

RoAModule.prototype = {
    name: "NO_NAME",
    loaded: false,
    dependencies: [],
    addDependency: function (name) {
        this.dependencies.push(name);
    },
    checkDependencies: function () {
        for(var i = 0; i < this.dependencies.length; i++) {
            var module = modules[this.dependencies[i]];
            if(module && module.loaded) {
                continue;
            }

            console.error("Dependency for module " + this.name + " was not satisfied: " + this.dependencies[i]);
            return false;
        }

        return true;
    },
    load: function () {
        this.loaded = true;

        var loadString = " - Loaded Module " + this.name;

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