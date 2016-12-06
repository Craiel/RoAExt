// Need notifications first
modules.notification.enable();

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    modules.notification.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    modules.notification.incompatibility("MutationObserver");
} else {

    // utility and core modules go first
    modules.cache.enable();
    modules.css.enable();
    modules.ajaxHooks.enable();

    // Automation
    modules.automateStamina.enable();

    // Chart
    modules.chartWindow.enable();

    // Chat
    modules.chatPeopleColor.enable();
    modules.chatTabs.enable();

    // Clan
    modules.clanDonations.enable();

    // Dungeon
    modules.dungeonMap.enable();

    // UI
    modules.uiSideMenu.enable();
}
