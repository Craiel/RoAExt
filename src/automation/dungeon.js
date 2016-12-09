(function ($) {
    'use strict';

    const DungeonDataVersion = 1;
    const Direction = {
        East: 0,
        North: 1,
        West: 2,
        South: 3
    };

    var enabled = false;
    var autoToggleButton;

    var currentRoomId;
    var playerMovedContext;

    function onDungeonInfo(e, res, req, jsonres) {
        if (!jsonres || !jsonres.data) {
            return;
        }

        var roomData;
        if(currentRoomId) {
            // We didn't move, get our current room info
            roomData = modules.settings.settings.dungeonData.rooms[currentRoomId];
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
        for(var i = 0; i < jsonres.data.enemies.length; i++) {
            enemyData.push(jsonres.data.enemies[i].id);
        }

        if(!roomData) {
            currentRoomId = modules.settings.settings.dungeonData.nextRoomId++;
            var moveLinks = [ null, null, null, null ];
            roomData = { id: currentRoomId, m: moveFlags, ml: moveLinks, e: enemyData, s: canSearch };
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
    }

    function onDungeonSearch(e, res, req, jsonres) {

        // TODO: see what we found and track

        // Forward to dungeon info
        onDungeonInfo(e, res, req, jsonres);
    }

    function onDungeonLeave(e, res, req, jsonres) {
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

        var previousRoomId = currentRoomId;
        var direction = parseMovementDirection(jsonres.m);

        // Find the room we moved into
        var previousRoomData = modules.settings.settings.dungeonData.rooms[previousRoomId];
        if (previousRoomData.ml[direction]) {
            // This room was known before we moved
            currentRoomId = previousRoomData.ml[playerMovedContext.direction];
        } else {
            // The room we moved into is not known
            currentRoomId = null;
        }

        // Proceed to update the current room's data
        onDungeonInfo(e, res, req, jsonres);

        // Now we have updated this room we need to ensure they are linked together properly
        var oppositeDirection = getOppositeDirection(direction);
        previousRoomData.ml[direction] = currentRoomId;
        modules.settings.settings.dungeonData.rooms[currentRoomId].ml[oppositeDirection] = previousRoomId;
    }

    function initializeDungeonData() {
        modules.settings.settings.dungeonData = { rooms: {}, nextRoomId: 1, version: DungeonDataVersion };
    }

    function continueAuto() {
        // TODO
    }

    function toggleAuto() {
        enabled = !enabled;
        updateToggleText();
    }

    function updateToggleText() {
        autoToggleButton.text("Auto " + enabled ? "On" : "Off");
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

            modules.ajaxHooks.register("dungeon_leave.php", onDungeonLeave);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonInfo);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonMove);

            RoAModule.prototype.load.apply(this);
        }
    });

    AutoDungeon.prototype.constructor = AutoDungeon;

    modules.automateDungeon = new AutoDungeon();

})(modules.jQuery);