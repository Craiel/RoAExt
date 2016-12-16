(function () {

    const IntervalName = "roaLoader";
    const LoadUpdateTime = 1000;

    var loadOperations = {
        essentials: [],
        optionals: [],
    };

    var loadTimer;

    function loadEnd() {
        RoAModule.prototype.load.apply(this);

        modules.logger.log("Loading finished!");
    }

    function continueLoadOptionals() {
        for (var i = 0; i < loadOperations.optionals.length; i++) {
            if(!loadOperations.optionals[i].loaded) {
                return;
            }
        }

        loadTimer.clear();

        loadEnd();
    }

    function beginLoadOptionals() {
        loadTimer.clear();

        modules.logger.log("Loading Optionals");
        for (var i = 0; i < loadOperations.optionals.length; i++) {
            loadOperations.optionals[i].load();
        }

        loadTimer.set(continueLoadOptionals, LoadUpdateTime);
    }

    function continueLoadEssentials() {
        loadTimer.clear();

        for (var i = 0; i < loadOperations.essentials.length; i++) {
            if(!loadOperations.essentials[i].loaded) {
                return;
            }
        }

        loadTimer.set(beginLoadOptionals, LoadUpdateTime);
    }

    function beginLoadEssentials() {
        loadTimer.clear();

        modules.logger.log("Loading Essentials");
        for (var i = 0; i < loadOperations.essentials.length; i++) {
            loadOperations.essentials[i].load();
        }

        loadTimer.set(continueLoadEssentials, LoadUpdateTime);
    }

    function Loader() {
        RoAModule.call(this, "Loader");
    }

    Loader.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            modules.logger.log("Initializing Module Loader");

            if(this.loadCallback) {
                this.loadCallback();
            }

            loadTimer = modules.createInterval(IntervalName);
            loadTimer.set(beginLoadEssentials, LoadUpdateTime);

            RoAModule.prototype.load.apply(this);
        },
        register: function (module, isEssential) {
            isEssential = isEssential || false;

            if(isEssential) {
                loadOperations.essentials.push(module);
            } else {
                loadOperations.optionals.push(module);
            }
        }
    });

    Loader.prototype.constructor = Loader;

    modules.loader = new Loader();

})();