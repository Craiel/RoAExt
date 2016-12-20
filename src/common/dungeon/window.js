(function ($) {
    'use strict';

    const DungeonRoomSize = 10;
    const DungeonRoomHalfSize = DungeonRoomSize / 2;
    const DungeonMapSize = DungeonRoomSize * 40;
    const DungeonMapHalfSize = DungeonMapSize / 2;
    const DungeonPlayerIndicatorSize = 2;
    const DungeonSearchIndicatorSize = 2;
    const DungeonEnemyIndicatorSize = 2;
    const DungeonExitIndicatorSize = 3;

    var interval;
    var template;
    var wnd;

    var tabMap;
    var tabStatistics;
    var tabData;

    var mapCanvas;
    var dungeonPositionInfo;

    var mapNeedsUpdate = true;

    function onDungeonChanged(requestData) {
        // flag the map for update in the next update cycle
        mapNeedsUpdate = true;
    }

    function drawTileWall(context, x, y, direction, canMove) {
        if (canMove === 0) {
            context.strokeStyle = modules.constants.DungeonWallColor;
            context.fillStyle   = "#ffffff";
        } else {
            context.strokeStyle = modules.constants.DungeonBackgroundColor;
            return;
        }

        context.beginPath();

        switch (direction) {
            case modules.dungeonDirections.directions.North: {
                context.moveTo(x - DungeonRoomHalfSize, y - DungeonRoomHalfSize);
                context.lineTo(x + DungeonRoomHalfSize, y - DungeonRoomHalfSize);
                break;
            }
            case modules.dungeonDirections.directions.South: {
                context.moveTo(x - DungeonRoomHalfSize, y + DungeonRoomHalfSize);
                context.lineTo(x + DungeonRoomHalfSize, y + DungeonRoomHalfSize);
                break;
            }
            case modules.dungeonDirections.directions.East: {
                context.moveTo(x + DungeonRoomHalfSize, y + DungeonRoomHalfSize);
                context.lineTo(x + DungeonRoomHalfSize, y - DungeonRoomHalfSize);
                break;
            }
            case modules.dungeonDirections.directions.West: {
                context.moveTo(x - DungeonRoomHalfSize, y - DungeonRoomHalfSize);
                context.lineTo(x - DungeonRoomHalfSize, y + DungeonRoomHalfSize);
                break;
            }
        }

        context.stroke();
        context.closePath();
    }

    function redrawMap() {
        var context = document.getElementById("dungeonMapCanvas").getContext('2d');

        // Clear the map first
        context.clearRect(0, 0, mapCanvas.width(), mapCanvas.height());

        if(!modules.settings.settings.dungeonData || !modules.settings.settings.dungeonData.rooms) {
            return;
        }

        for (var key in modules.settings.settings.dungeonData.rooms) {
            var room = modules.settings.settings.dungeonData.rooms[key];
            var isCurrent = room.id === modules.settings.settings.dungeonData.currentRoomId;

            var centerX = DungeonMapHalfSize + (room.pos[0] * DungeonRoomSize);
            var centerY = DungeonMapHalfSize + ((room.pos[1] * -1) * DungeonRoomSize);

            // Draw this room
            context.fillStyle = modules.constants.DungeonBackgroundColor;
            context.fillRect(centerX-DungeonRoomHalfSize, centerY-DungeonRoomHalfSize, DungeonRoomSize, DungeonRoomSize);

            drawTileWall(context, centerX, centerY, modules.dungeonDirections.directions.North, room.m[modules.dungeonDirections.directions.North.id]);
            drawTileWall(context, centerX, centerY, modules.dungeonDirections.directions.South, room.m[modules.dungeonDirections.directions.South.id]);
            drawTileWall(context, centerX, centerY, modules.dungeonDirections.directions.East, room.m[modules.dungeonDirections.directions.East.id]);
            drawTileWall(context, centerX, centerY, modules.dungeonDirections.directions.West, room.m[modules.dungeonDirections.directions.West.id]);

            if (room.s) {
                context.fillStyle     = modules.constants.DungeonRoomSearchedColor;
                context.strokeStyle   = modules.constants.DungeonRoomSearchedColor;
                context.arc(centerX, centerY, DungeonSearchIndicatorSize, 0, DungeonSearchIndicatorSize * Math.PI);
                context.fill();
            }

            if (room.e.length > 0) {
                context.fillStyle     = modules.constants.DungeonRoomHasEnemiesColor;
                context.strokeStyle   = modules.constants.DungeonRoomHasEnemiesColor;
                context.arc(centerX, centerY, DungeonEnemyIndicatorSize, 0, DungeonEnemyIndicatorSize * Math.PI);
                context.fill();
            }

            if(isCurrent) {
                context.fillStyle     = modules.constants.DungeonPlayerColor;
                context.strokeStyle   = modules.constants.DungeonPlayerColor;
                context.arc(centerX, centerY, DungeonPlayerIndicatorSize, 0, DungeonPlayerIndicatorSize * Math.PI);
                context.fill();
            }

            if(room.m[4]) {
                // Exit room
                context.fillStyle     = modules.constants.DungeonExitColor;
                context.strokeStyle   = modules.constants.DungeonExitColor;
                context.arc(centerX, centerY, DungeonExitIndicatorSize, 0, DungeonExitIndicatorSize * Math.PI);
                context.fill();
            }

            // Draw a border for the map
            context.strokeStyle = modules.constants.DungeonCanvasBorderColor;
            context.strokeRect(1, 1, DungeonMapSize - 2, DungeonMapSize - 2);
        }
    }

    function onUpdate() {
        if(mapNeedsUpdate) {
            redrawMap();
            mapNeedsUpdate = false;
        }

        if(!modules.settings.settings.dungeonData.currentRoomId) {
            dungeonPositionInfo.text("Not in Dungeon!");
            return;
        }

        var currentRoom = modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId];
        dungeonPositionInfo.text("Room " + currentRoom.id + " (x: " + currentRoom.pos[0] + " y: " + currentRoom.pos[1] + ")");
    }

    function createMap() {
        // Dungeon Info
        var dungeonInfoWrapper = $('<div class="center" style="margin-top: 10px"></div>')
        dungeonPositionInfo = $('<span></span>');
        dungeonInfoWrapper.append(dungeonPositionInfo);

        // Map Container
        var container = $('<div id="dungeonMapContainer"></div>');
        var title = $('<h5 class="center" style="margin: 10px"><span>Dungeon Map</span></h5>');
        mapCanvas = $('<canvas id="dungeonMapCanvas" style="margin-left: 10px" width="' + DungeonMapSize + '" height="' + DungeonMapSize + '"></canvas>');
        container.append(title);
        container.append(mapCanvas);

        tabMap.append(dungeonInfoWrapper);
        tabMap.append(container);
    }

    function createTab(contentId, toggleId) {
        var tab = $('#' + contentId);
        var toggle = $('#' + toggleId);
        toggle.click({id: contentId}, function (e) {
            $('#' + e.data.id).toggle();
        });

        tab.hide();
        return tab;
    }

    function onClick() {
        wnd.toggle();
    }

    function DungeonWindow() {
        RoAModule.call(this, "Dungeon Window");
    }

    DungeonWindow.prototype = Object.spawn(RoAModule.prototype, {
        continueLoad: function () {

            wnd = $(template);
            wnd.appendTo("body");
            wnd.draggable({handle:"#dungeonWindowTitle"});
            wnd.resizable();
            wnd.hide();

            $('#dungeonWindowClose').click(function () {
                wnd.hide();
            });

            tabMap = createTab('dungeonWndMap', 'dungeonCtrlMap');
            tabStatistics = createTab('dungeonWndStatistics', 'dungeonCtrlStatistics');
            tabData = createTab('dungeonWndData', 'dungeonCtrlData');

            // Start with the map active by default
            tabMap.show();

            createMap();

            modules.uiScriptMenu.addLink("Dungeon", onClick);

            modules.ajaxHooks.register("dungeon_search.php", onDungeonChanged);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonChanged);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonChanged);
            modules.ajaxHooks.register("dungeon_battle.php", onDungeonChanged);

            interval = modules.createInterval("DungeonWindowUpdate");
            interval.set(onUpdate, 500);

            RoAModule.prototype.load.apply(this);
        },
        load: function () {
            template = modules.templates.dungeonWindow;
            this.continueLoad();
        }
    });

    DungeonWindow.prototype.constructor = DungeonWindow;

    modules.dungeonWindow = new DungeonWindow();

})(modules.jQuery);