(function () {

    function initializeEssentials() {
        // utility and core modules go first
        modules.loader.register(modules.cache, true);
        modules.loader.register(modules.css, true);
        modules.loader.register(modules.ajaxHooks, true);

        modules.loader.register(modules.uiScriptMenu, true);
        modules.loader.register(modules.uiTimerMenu, true);

        modules.loader.register(modules.settingsWindow, true);

        modules.loader.register(modules.playerGainTracker, true);
    }

    function initializeOptionals() {
        // Chart
        modules.loader.register(modules.chartWindow);

        // Chat
        modules.loader.register(modules.chatPeopleColor);
        modules.loader.register(modules.chatTabs);

        // Clan
        modules.loader.register(modules.clanDonations);

        // Dungeon
        modules.loader.register(modules.dungeonTracker);
        modules.loader.register(modules.dungeonWindow);

        // House
        modules.loader.register(modules.houseMonitor);

        // Market
        modules.loader.register(modules.marketTracker);
        modules.loader.register(modules.marketWindowEnhancements);

        // Misc
        modules.loader.register(modules.uiNoteWindow);
        modules.loader.register(modules.uiTimerEditor);
        modules.loader.register(modules.uiActionShortcuts);
        modules.loader.register(modules.effectMonitor);
        modules.loader.register(modules.eventMonitor);
        modules.loader.register(modules.sessionTime);
        modules.loader.register(modules.notificationSettings);

        // Player
        modules.loader.register(modules.playerGainWindow);
        modules.loader.register(modules.gainPerHourDisplay);
        modules.loader.register(modules.playerMilestoneBar);
    }
    
    modules.loader.loadCallback = function () {        
        initializeEssentials();
        initializeOptionals();
    }

})();