// Some core modules go before everything
modules.logger.load();
modules.notification.load();

//Check if the user can even support the bot
if (typeof(window.sessionStorage) === "undefined") {
    modules.notification.incompatibility("Session storage");
} else if (typeof(MutationObserver) === "undefined") {
    modules.notification.incompatibility("MutationObserver");
} else {
    modules.loader.load();
}
