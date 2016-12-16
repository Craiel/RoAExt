(function ($) {
    'use strict';

    function updateIngredientIdsFromQuery(result) {
        const select = $("<select/>"),
            mats = {};
        select.html(result.filter);

        select.find(">option:not([value=all])").each(function () {
            const $this = $(this);
            mats[$this.text().trim()] = parseInt($this.val());
        });

        window.sessionStorage.setItem("TRADESKILL_MATERIAL_IDS", JSON.stringify(mats));
        modules.cache.TRADESKILL_MATS = mats;
    }

    function Cache() {
        RoAModule.call(this, "Cache");
    }

    Cache.prototype = Object.spawn(RoAModule.prototype, {
        TRADESKILL_MATS: {},
        updateIngredientIds: function() {
            const cached_ids = window.sessionStorage.getItem("TRADESKILL_MATERIAL_IDS");
            if (cached_ids) {
                this.TRADESKILL_MATS = JSON.parse(cached_ids);
            } else {
                $.post("market.php", { type: "ingredient", page: 0, st: "all" }, updateIngredientIdsFromQuery);
            }
        },
        load: function () {
            this.updateIngredientIds();

            RoAModule.prototype.load.apply(this);
        }
    });

    Cache.prototype.constructor = Cache;

    modules.cache = new Cache();

})(modules.jQuery);