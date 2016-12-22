(function () {
    'use strict';

    function NotificationSettings() {
        RoAModule.call(this, "Notification Settings");

        this.addDependency("notification");
        this.addDependency("settingsWindow");
    }

    NotificationSettings.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            var setting = modules.createSetting("Notifications", "Enable", "Enable all notifications");
            setting.callback = function (x) {
                modules.settings.settings.notification.enable = x.value;
            };

            setting = modules.createSetting("Notifications", "Enable Sounds", "Enable all notification sounds");
            setting.callback = function (x) {
                modules.settings.settings.notification.enableSound = x.value;
            };

            RoAModule.prototype.load.apply(this);
        }
    });

    NotificationSettings.prototype.constructor = NotificationSettings;

    modules.notificationSettings = new NotificationSettings();

})();