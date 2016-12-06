(function ($) {
    'use strict';

    var module = {};

    module.enable = function () {
        $.get(modules.constants.URLS.html.settings_modal).done(function (r) {
            modules.constants.$DOM.modal.script_settings = $(r);
            $("#modalContent").append(modules.constants.$DOM.modal.script_settings);
            modules.utils.tabify(modules.constants.$DOM.modal.script_settings);

            modules.constants.$DOM.modal.script_settings.find('[data-setting="notifications"]')
                .each(modules.handlers.each.settings_notification)
                .change(modules.handlers.change.settings_notification);

            modules.constants.$DOM.modal.script_settings.find('[data-setting="features"]')
                .each(modules.handlers.each.settings_features)
                .change(modules.handlers.change.settings_feature);

            modules.observers.script_settings.observe(modules.constants.$DOM.modal.modal_wrapper[0], {attributes: true});
        });
    };

    modules.uiSettings = module;

})(modules.jQuery);