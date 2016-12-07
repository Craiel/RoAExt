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

        for (var i = 0; i < loadOperations.essentials.length; i++) {
            loadOperations.essentials[i].load();
        }

        loadTimer.set(continueLoadEssentials, LoadUpdateTime);
    }

    function initializeEssentials() {
        loadOperations.essentials = [];

        // utility and core modules go first
        loadOperations.essentials.push(modules.cache);
        loadOperations.essentials.push(modules.css);
        loadOperations.essentials.push(modules.ajaxHooks);

        loadOperations.essentials.push(modules.uiScriptMenu);
        loadOperations.essentials.push(modules.uiTimerMenu);
    }

    function initializeOptionals() {
        // Automation
        loadOperations.optionals.push(modules.automateStamina);

        // Chart
        loadOperations.optionals.push(modules.chartWindow);

        // Chat
        loadOperations.optionals.push(modules.chatPeopleColor);
        loadOperations.optionals.push(modules.chatTabs);

        // Clan
        loadOperations.optionals.push(modules.clanDonations);

        // Dungeon
        loadOperations.optionals.push(modules.dungeonMap);

        // House
        loadOperations.optionals.push(modules.houseMonitor);

        // UI
        loadOperations.optionals.push(modules.uiDebugWindow);
        loadOperations.optionals.push(modules.uiChartMenu);
        loadOperations.optionals.push(modules.uiNoteWindow);
        loadOperations.optionals.push(modules.uiTimerEditor);
        loadOperations.optionals.push(modules.uiActionShortcuts);
    }

    function Loader() {
        RoAModule.call(this, "Loader");
    }

    Loader.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            modules.logger.log("Beginning Load...");

            initializeEssentials();
            initializeOptionals();

            loadTimer = modules.createInterval(IntervalName);
            loadTimer.set(beginLoadEssentials, LoadUpdateTime);
        }
    });

    Loader.prototype.constructor = Loader;

    modules.loader = new Loader();

})();