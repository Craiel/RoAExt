(function () {

    const DungeonDataVersion = 3;

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

        // copy the position we are in to the room position
        roomData.pos = [modules.settings.settings.dungeonData.position[0], modules.settings.settings.dungeonData.position[1]];

        // Update the room data
        modules.settings.settings.dungeonData.rooms[roomData.id] = roomData;

        console.log("Dungeon Room Update: " + roomData.id);
        console.log(roomData);
        console.log(modules.settings.settings.dungeonData);
    }

    function onDungeonSearch(requestData) {
        console.log("OnDungeonSearch: ");
        console.log(requestData);

        // TODO: see what we found and track

        // Forward to dungeon info
        onDungeonInfo(requestData);
    }

    function onDungeonLeave(requestData) {
        console.log("OnDungeonLeave: ");
        console.log(requestData);

        initializeDungeonData();
    }

    function onDungeonMove(requestData) {
        console.log("OnDungeonMove: ");
        console.log(requestData);

        var previousRoomId = modules.settings.settings.dungeonData.currentRoomId;
        var direction = modules.dungeonDirections.parse(requestData.json.m, true);

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
    }

    function onDungeonBattle(requestData) {
        console.log("OnDungeonBattle");
        console.log(requestData);
    }

    function initializeDungeonData() {
        modules.settings.settings.dungeonData = {
            rooms: {},
            nextRoomId: 1,
            exitRoom: null,
            version: DungeonDataVersion,
            position: [0, 0],
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