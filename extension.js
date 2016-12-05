//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    toast.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    toast.incompatibility("MutationObserver");
} else {

    // utility and core modules go first
    modules.cache.enable();
    modules.css.enable();
    modules.toast.enable();
    modules.trackers.enable();
    modules.ajaxHooks.enable();

    // Automation
    modules.automateStamina.enable();

    // Chart
    modules.chartWindow.enable();

    // Chat
    modules.chatPeopleColor.enable();
    modules.chatTabs.enable();
    modules.chatWhisperMonitor.enable();

    // Clan
    modules.clanDonations.enable();

    // Dungeon
    modules.dungeonMap.enable();

    // House
    modules.houseMonitor.enable();

    // Market
    modules.marketTooltips.enable();

    // UI
    modules.uiSideMenu.enable();
    modules.uiSettings.enable();
    modules.uiTooltips.enable();
}
