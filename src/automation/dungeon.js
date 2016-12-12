(function ($) {
    'use strict';

    const DungeonDataVersion = 1;
    const Direction = {
        East: 0,
        North: 1,
        West: 2,
        South: 3
    };

    var locked = true;
    var enabled = false;
    var autoToggleButton;
    var dungeonInfoRefreshTimer;

    function onDungeonInfo(e, res, req, jsonres) {
        if (!jsonres || !jsonres.data) {
            return;
        }

        console.log("OnDungeonInfo: ");
        console.log(jsonres);

        var roomData;
        if(modules.settings.settings.dungeonData.currentRoomId) {
            // We didn't move, get our current room info
            roomData = modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId];
        }

        // gather the info about the current room
        var moveEast = jsonres.data.e;
        var moveNorth = jsonres.data.n;
        var moveSouth = jsonres.data.s;
        var moveWest = jsonres.data.w;
        var moveDown = jsonres.data.d;
        var canSearch = jsonres.data.search;

        // e, n, w, s, d
        var moveFlags = [ moveEast ? 1 : 0, moveNorth ? 1 : 0, moveWest ? 1 : 0, moveSouth ? 1 : 0, moveDown ? 1 : 0 ];

        var enemyData = [];
        for(var num in jsonres.data.enemies) {
            enemyData.push(jsonres.data.enemies[num].id);
        }

        if(!roomData) {
            modules.settings.settings.dungeonData.currentRoomId = modules.settings.settings.dungeonData.nextRoomId++;
            var moveLinks = [ null, null, null, null ];
            roomData = { id: modules.settings.settings.dungeonData.currentRoomId, m: moveFlags, ml: moveLinks, e: enemyData, s: canSearch };
        } else {
            roomData.m = moveFlags;
            roomData.e = enemyData;
            roomData.s = canSearch;
        }

        // Update the room data
        modules.settings.settings.dungeonData.rooms[roomData.id] = roomData;

        console.log("Dungeon Room Update: " + roomData.id);
        console.log(roomData);
        console.log(modules.settings.settings.dungeonData);

        // unlock the auto mode
        locked = false;
    }

    function onDungeonSearch(e, res, req, jsonres) {
        console.log("OnDungeonSearch: ");
        console.log(jsonres);

        // TODO: see what we found and track

        // Forward to dungeon info
        onDungeonInfo(e, res, req, jsonres);
    }

    function onDungeonLeave(e, res, req, jsonres) {
        console.log("OnDungeonLeave: ");
        console.log(jsonres);

        enabled = false;
        initializeDungeonData();
    }

    function parseMovementDirection(msg) {
        if(msg.includes("east")) {
            return Direction.East;
        } else if (msg.includes("north")) {
            return Direction.North;
        } else if (msg.includes("west")) {
            return Direction.West;
        } else if (msg.includes("south")) {
            return Direction.South;
        }

        console.log("Unknown Movement Direction: " + msg);
    }

    function getOppositeDirection(direction) {
        if (direction === Direction.North) {
            return Direction.South;
        } else if (direction === Direction.South) {
            return Direction.North;
        } else if (direction === Direction.East) {
            return Direction.West;
        } else if (direction === Direction.West) {
            return Direction.East;
        }
    }

    function onDungeonMove(e, res, req, jsonres) {
        console.log("OnDungeonMove: ");
        console.log(jsonres);

        var previousRoomId = modules.settings.settings.dungeonData.currentRoomId;
        var direction = parseMovementDirection(jsonres.m);

        // Find the room we moved into
        var previousRoomData = modules.settings.settings.dungeonData.rooms[previousRoomId];
        if (previousRoomData.ml[direction]) {
            // This room was known before we moved
            modules.settings.settings.dungeonData.currentRoomId = previousRoomData.ml[direction];
        } else {
            // The room we moved into is not known
            modules.settings.settings.dungeonData.currentRoomId = null;
        }

        // Proceed to update the current room's data
        onDungeonInfo(e, res, req, jsonres);

        // Now we have updated this room we need to ensure they are linked together properly
        var oppositeDirection = getOppositeDirection(direction);
        previousRoomData.ml[direction] = modules.settings.settings.dungeonData.currentRoomId;
        modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId].ml[oppositeDirection] = previousRoomId;
    }

    function onDungeonBattle(e, res, req, jsonres) {
        console.log("OnDungeonBattle");
        console.log(jsonres);
    }

    function initializeDungeonData() {
        modules.settings.settings.dungeonData = { rooms: {}, nextRoomId: 1, version: DungeonDataVersion };
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

        // Nothing left to do but move
        //locked = true;

        console.log("TODO: Dungeon_Move");
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

    function AutoDungeon() {
        RoAModule.call(this, "Auto Dungeon");
    }

    AutoDungeon.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

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

            if (!modules.settings.settings.dungeonData || modules.settings.settings.dungeonData.version != DungeonDataVersion) {
                initializeDungeonData();
            }

            dungeonInfoRefreshTimer = modules.createInterval("DungeonAutoRefreshInfo");

            modules.ajaxHooks.register("dungeon_leave.php", onDungeonLeave);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonInfo);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonMove);
            modules.ajaxHooks.register("dungeon_battle.php", onDungeonBattle);

            RoAModule.prototype.load.apply(this);
        }
    });

    AutoDungeon.prototype.constructor = AutoDungeon;

    modules.automateDungeon = new AutoDungeon();

})(modules.jQuery);