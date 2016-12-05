(function ($) {
    'use strict';

    var module = {};

    function updateIngredientIds() {
        const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
        if (cached_ids) {
            modules.cache.TRADESKILL_MATS = JSON.parse(cached_ids);
        } else {
            $.post("/market.php", {
                type: "ingredient",
                page: 0,
                st: "all"
            }, function (r) {
                const select = $("<select/>"),
                    mats = {};
                select.html(r.filter);

                select.find(">option:not([value=all])").each(function () {
                    const $this = $(this);
                    mats[$this.text().trim()] = parseInt($this.val());
                });

                window.sessionStorage.setItem("TRADESKILL_MATERIAL_IDS", JSON.stringify(mats));
                modules.cache.TRADESKILL_MATS = mats;
            });
        }
    }

    module.TRADESKILL_MATS = {};

    module.enable = function () {
        updateIngredientIds();
    };

    modules.cache = module;

})(modules.jQuery);