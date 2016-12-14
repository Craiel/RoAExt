(function ($) {
    'use strict';

    var locked = true;
    var enabled = false;
    var autoDelay = 500;
    var earliestAuto = Date.now();
    var autoToggleButton;
    var dungeonAutoActionTimer;

    function onAutoDungeon() {
        if(locked || !enabled) {
            return;
        }

        if(Date.now() < earliestAuto) {
            // Too early after last call to proceed
            return;
        }

        continueAuto();
    }

    function continueAuto() {
        if(locked) {
            modules.logger.warn("Dungeon Auto is locked!");
            return;
        }

        if(!modules.settings.settings.dungeonData.currentRoomId) {
            modules.logger.warn("Dungeon room is not known yet!");
            return;
        }

        // TODO
        var roomData = modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId];
        if(roomData.e.length > 0) {
            // This room still has enemies, suggest fight
            locked = true;


            var battleLink = $('#dungeonEnemyList').find('.dungeon_fight').first();

            modules.logger.log("Dungeon Auto: Battle with ID " + battleLink.attr("data-id"));
            battleLink.click();

            return;
        }

        if(roomData.s) {
            // This room was not searched yet, suggest search
            locked = true;

            modules.logger.log("Dungeon Auto: Search");
            $('#dungeonSearch').click();

            return;
        }

        // First check if we have somewhere to move that we have not been yet
        var availableUnexploredDirection = -1;
        for(var i = 0; i < 4; i++) {
            if(roomData.m[i] && !roomData.ml[i]) {
                availableUnexploredDirection = i;
                break;
            }
        }

        if(availableUnexploredDirection >= 0) {
            var directionToMove = modules.dungeonDirections.parseInt(availableUnexploredDirection);
            locked = true;

            modules.logger.log("Dungeon Auto: Moving to unexplored cell on " + directionToMove.key);

            var moveLink = $('#dungeonNavigation').find('[data-direction="'+ directionToMove.stringValue +'"]');
            moveLink.click();
            return;
        }

        // Nowhere left to go, have to back-track
        //locked = true;

        console.log("TODO: Dungeon_Backtrack");
        enabled = false;
        // east, west, north, south, down
        // $.post("dungeon_move.php", { dir: });
    }

    function toggleAuto() {
        enabled = !enabled;
        updateToggleText();
    }

    function updateToggleText() {
        var text = enabled ? "On" : "Off";
        autoToggleButton.text("Auto " + text);
    }

    function DungeonAutomate() {
        RoAModule.call(this, "Dungeon Automate");

        this.addDependency("dungeonTracker");
    }

    DungeonAutomate.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            autoToggleButton = $('<a></a>');
            autoToggleButton.click(toggleAuto);
            updateToggleText();

            var wrapper = $('<div class="bt1 mt10 center"></div>');
            wrapper.append(autoToggleButton);
            $('#dungeonInfo').append(wrapper);

            var manualContinueButton = $('<a>(A) Next</a>');
            manualContinueButton.click(continueAuto);

            var wrapper = $('<div class="bt1 mt10 center"></div>');
            wrapper.append(manualContinueButton);
            $('#dungeonInfo').append(wrapper);

            dungeonAutoActionTimer = modules.createInterval("DungeonAutoAction");
            dungeonAutoActionTimer.set(onAutoDungeon, 200);

            /*modules.ajaxHooks.register("dungeon_leave.php", onDungeonLeave);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonInfo);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonMove);
            modules.ajaxHooks.register("dungeon_battle.php", onDungeonBattle);*/

            RoAModule.prototype.load.apply(this);
        }
    });

    DungeonAutomate.prototype.constructor = DungeonAutomate;

    modules.dungeonAutomate = new DungeonAutomate();

})(modules.jQuery);