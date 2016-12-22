(function () {
    'use strict';

    const DungeonDataVersion = 4;

    function onDungeonInfo(requestData) {
        if (!requestData.json.data) {
            return;
        }

        var roomData;
        if(modules.settings.settings.dungeonData.currentRoomId) {
            // We didn't move, get our current room info
            roomData = modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId];
        }

        // gather the info about the current room
        var moveEast = requestData.json.data.e;
        var moveNorth = requestData.json.data.n;
        var moveSouth = requestData.json.data.s;
        var moveWest = requestData.json.data.w;
        var moveDown = requestData.json.data.d;
        var canSearch = requestData.json.data.search;

        // e, n, w, s, d
        var moveFlags = [ moveEast ? 1 : 0, moveNorth ? 1 : 0, moveWest ? 1 : 0, moveSouth ? 1 : 0, moveDown ? 1 : 0 ];

        var enemyData = [];
        for(var num in requestData.json.data.enemies) {
            enemyData.push(requestData.json.data.enemies[num].id);
        }

        if(!roomData) {
            modules.settings.settings.dungeonData.currentRoomId = modules.settings.settings.dungeonData.nextRoomId++;
            var moveLinks = [ null, null, null, null ];
            roomData = { id: modules.settings.settings.dungeonData.currentRoomId, m: moveFlags, ml: moveLinks, e: enemyData, s: canSearch, x: true };
        } else {
            roomData.m = moveFlags;
            roomData.e = enemyData;
            roomData.s = canSearch;
        }

        if(moveDown) {
            modules.settings.settings.dungeonData.exitRoom = roomData.id;
        }

        // copy the position we are in to the room position
        roomData.pos = [modules.settings.settings.dungeonData.position[0], modules.settings.settings.dungeonData.position[1]];

        // Update the room data
        modules.settings.settings.dungeonData.rooms[roomData.id] = roomData;

        // Set the dungeon to idle
        modules.session.dungeonNeedsUpdate = false;
    }

    function onDungeonSearch(requestData) {
        modules.settings.settings.dungeonData.statistics.RoomsSearched++;

        // Forward to dungeon info
        onDungeonInfo(requestData);
    }

    function onDungeonLeave(requestData) {
        initializeDungeonData();
    }

    function onDungeonMove(requestData) {
        if(!requestData.json) {
            // Assume we moved down
            initializeDungeonData();
            modules.session.dungeonNeedsUpdate = true;
            return;
        }

        if (requestData.json.m === "You cannot go that way.") {
            return;
        }

        var previousRoomId = modules.settings.settings.dungeonData.currentRoomId;
        var direction = modules.dungeonDirections.parse(requestData.json.m, true);

        if(!direction) {
            // We don't know where or how we moved, reset all dungeon data
            initializeDungeonData();
            modules.session.dungeonNeedsUpdate = true;
            return;
        }

        // Find the room we moved into
        var previousRoomData = modules.settings.settings.dungeonData.rooms[previousRoomId];
        if (previousRoomData.ml[direction.id]) {
            // This room was known before we moved
            modules.settings.settings.dungeonData.currentRoomId = previousRoomData.ml[direction.id];
        } else {
            // The room we moved into is not known
            modules.settings.settings.dungeonData.currentRoomId = null;
        }

        // Change our current position to reflect the move
        adjustPosition(direction);

        // Proceed to update the current room's data
        onDungeonInfo(requestData);

        // Now we have updated this room we need to ensure they are linked together properly
        previousRoomData.ml[direction.id] = modules.settings.settings.dungeonData.currentRoomId;
        modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId].ml[direction.opposite.id] = previousRoomId;

        modules.settings.settings.dungeonData.statistics.TimesMoved++;
    }

    function onDungeonBattle(requestData) {
        if(requestData.json.b && requestData.json.b.xp > 0) {
            modules.settings.settings.dungeonData.statistics.MonstersKilled++;
        }
    }

    function initializeDungeonData() {
        modules.settings.settings.dungeonData = {
            rooms: {},
            currentRoomId: null,
            nextRoomId: 1,
            exitRoom: null,
            version: DungeonDataVersion,
            position: [0, 0],
            statistics: {
                TimesMoved: 0,
                RoomsSearched: 0,
                MonstersKilled: 0
            }
        };
    }

    function adjustPosition(direction, count) {
        var steps = count || 1;
        if (direction === modules.dungeonDirections.directions.North) {
            modules.settings.settings.dungeonData.position[1] += steps;
        } else if (direction === modules.dungeonDirections.directions.South) {
            modules.settings.settings.dungeonData.position[1] -= steps;
        } else if (direction === modules.dungeonDirections.directions.East) {
            modules.settings.settings.dungeonData.position[0] += steps;
        } else if (direction === modules.dungeonDirections.directions.West) {
            modules.settings.settings.dungeonData.position[0] -= steps;
        }
    }

    function DungeonTracker() {
        RoAModule.call(this, "Dungeon Tracker");
    }

    DungeonTracker.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            if (!modules.settings.settings.dungeonData || modules.settings.settings.dungeonData.version != DungeonDataVersion) {
                initializeDungeonData();
            }

            modules.ajaxHooks.register("dungeon_leave.php", onDungeonLeave);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonInfo);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonMove);
            modules.ajaxHooks.register("dungeon_battle.php", onDungeonBattle);

            RoAModule.prototype.load.apply(this);
        }
    });

    DungeonTracker.prototype.constructor = DungeonTracker;

    modules.dungeonTracker = new DungeonTracker();

})();