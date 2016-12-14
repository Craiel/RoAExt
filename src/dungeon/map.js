(function ($) {
    'use strict';

    var dmc, dmctx, dmv;

    var initialize = function () {
        console.log("Resetting Dungeon Map");

        modules.settings.dungeonMap = { r:{}, cf:0, ct:null, v: modules.constants.DungeonMapVersion, hasData: false };
    };

    function onLeaveDungeon() {
        initialize();
    }

    function onUpdateDungeonVisibility(requestData) {
        if(requestData.url.indexOf("dungeon_") === -1) {
            $("#dMCW").hide();
        } else if (modules.settings.dungeonMap.hasData) {
            $("#dMCW").show();
        }
    }

    function onUpdateDungeon(requestData) {
        if (requestData.json.hasOwnProperty("data") && requestData.json.data.hasOwnProperty("map")) {
            modules.settings.dungeonMap.hasData = true;

            if (modules.settings.dungeonMap.cf !== requestData.json.data.floor) {
                modules.settings.dungeonMap.r = {};
                modules.settings.dungeonMap.cf = requestData.json.data.floor;
            }
            var jrd = requestData.json.data;
            var data = {};
            var token = $(jrd.map).text().replace("↓", "v"); // map
            token = btoa(JSON.stringify(token)); // token
            if (modules.settings.dungeonMap.r.hasOwnProperty(token)) {
                data = JSON.parse(JSON.stringify(modules.settings.dungeonMap.r[token]));
            } else {
                data.pe = "";
                data.ps = "";
                data.pn = "";
                data.pw = "";
                data.t  = token;
            }

            if (modules.settings.dungeonMap.ct === null) {
                modules.settings.dungeonMap.ct = token;
            }

            data.e = jrd.e?1:0; // east
            data.s = jrd.s?1:0; // south
            data.n = jrd.n?1:0; // north
            data.w = jrd.w?1:0; // west
            data.r = !!jrd.search; // raided
            data.b = Object.keys(jrd.enemies).length; // battles available

            modules.settings.dungeonMap.r[data.t] = data;

            var walk = requestData.json.hasOwnProperty("m") && jsonres.m.match(/You walked (east|south|north|west)/);
            walk = walk ? requestData.json.m.match(/You walked (east|south|north|west)/) : false;
            if (walk !== false) {
                walk = walk[1].match(/^./)[0];
                if (modules.settings.dungeonMap.ct !== data.t) {
                    if (typeof modules.settings.dungeonMap.r[modules.settings.dungeonMap.ct] !== "undefined") {
                        modules.settings.dungeonMap.r[modules.settings.dungeonMap.ct]["p"+walk] = data.t;
                        var sm = {
                            "s": "n",
                            "n": "s",
                            "e": "w",
                            "w": "e"
                        };
                        modules.settings.dungeonMap.r[data.t]["p"+sm[walk]] = modules.settings.dungeonMap.ct;
                    }
                    modules.settings.dungeonMap.ct = data.t;
                }
            }

            modules.settings.save();
            updateDungeonMap();
        }
    }

    function onResizeEnd(e) {
        $("#dungeonMapCanvas").attr({width: modules.settings.dungeonMap.size.width, height: modules.settings.dungeonMap.size.height});
        updateDungeonMap(false);
    }

    function updateDungeonMap() {
        if ($("#dungeonMapCanvas").length === 0) {
            var h = $("<div>")
                .attr("id", "dMCW")
                .css({position:"absolute",top:0,left:0})
                .addClass("border2 ui-component")
                .appendTo("body");
            $("<canvas>").attr({
                id: "dungeonMapCanvas",
                width: "325",
                height: "325"
            }).appendTo("#dMCW");
            h.draggable({handle:"#dungeonMapCanvas"}).resizable({stop: onResizeEnd});
            dmc = document.getElementById("dungeonMapCanvas");
            dmctx = dmc.getContext("2d");
        }

        dmv = [];
        dmctx.clearRect(0,0,dmc.width,dmc.height);
        drawTile(modules.settings.dungeonMap.ct, Math.floor(dmc.width/2), Math.floor(dmc.height/2), 1);
    }

    function drawTile(id, x, y, player) {
        if (typeof player === "undefined") {
            player = 0;
        }

        if (dmv.indexOf(id) !== -1) {
            return;
        }
        var tile = modules.settings.dungeonMap.r[id];
        dmv.push(id);

        // console.log(id,x,y);
        // console.log(JSON.stringify(tile, null, "\t"));

        dmctx.fillStyle = "#333";
        dmctx.fillRect(x-4, y-4, 10, 10);

        drawTileWall(x,y,"top", !tile.n);
        drawTileWall(x,y,"left", !tile.w);
        drawTileWall(x,y,"right", !tile.e);
        drawTileWall(x,y,"bot", !tile.s);

        if (tile.r) {
            dmctx.fillStyle     = modules.constants.DungeonRoomSearchedColor;
            dmctx.strokeStyle   = modules.constants.DungeonRoomSearchedColor;
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.b > 0) {
            dmctx.fillStyle     = modules.constants.DungeonRoomHasEnemiesColor;
            dmctx.strokeStyle   = modules.constants.DungeonRoomHasEnemiesColor;
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (player === 1) {
            dmctx.fillStyle     = modules.constants.DungeonPlayerColor;
            dmctx.strokeStyle   = modules.constants.DungeonPlayerColor;
            dmctx.arc(x,y,2, 0, 2*Math.PI);
            dmctx.fill();
        }

        if (tile.n === 1 && tile.pn !== "") {
            // console.log(tile.pn);
            drawTile(tile.pn, x, y-10);
        }
        if (tile.w === 1 && tile.pw !== "") {
            // console.log(tile.pw);
            drawTile(tile.pw, x-10, y);
        }
        if (tile.e === 1 && tile.pe !== "") {
            // console.log(tile.pe);
            drawTile(tile.pe, x+10, y);
        }
        if (tile.s === 1 && tile.ps !== "") {
            // console.log(tile.ps);
            drawTile(tile.ps, x, y+10);
        }
    }

    function drawTileWall(x,y,which, blocked) {
        if (blocked) {
            dmctx.strokeStyle = modules.constants.DungeonWallColor;
            dmctx.fillStyle   = "#ffffff";
        } else {
            dmctx.strokeStyle = "#333";
            return;
        }
        dmctx.beginPath();
        if (which === "top") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "left") {
            dmctx.moveTo(x-5, y-5);
            dmctx.lineTo(x-5, y+5);
        } else if (which === "right") {
            dmctx.moveTo(x+5, y+5);
            dmctx.lineTo(x+5, y-5);
        } else if (which === "bot") {
            dmctx.moveTo(x-5, y+5);
            dmctx.lineTo(x+5, y+5);
        }
        dmctx.stroke();
        dmctx.closePath();
    }

    function DungeonMap() {
        RoAModule.call(this, "Dungeon Map");

        this.addDependency("dungeonTracker");
    }

    DungeonMap.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            if(modules.settings.dungeonMap == null) {
                initialize();
            } else {
                try {
                    if(modules.settings.dungeonMap == null || modules.settings.dungeonMap.v == null || modules.settings.dungeonMap.v != modules.constants.DungeonMapVersion)
                    {
                        initialize();
                    }
                } catch (e) {
                    initialize();
                }
            }

            modules.ajaxHooks.register("dungeon_leave.php", onLeaveDungeon);
            modules.ajaxHooks.register("dungeon_info.php", onUpdateDungeon);
            modules.ajaxHooks.register("dungeon_move.php", onUpdateDungeon);
            modules.ajaxHooks.register("dungeon_search.php", onUpdateDungeon);

            modules.ajaxHooks.registerAll(onUpdateDungeonVisibility);

            RoAModule.prototype.load.apply(this);
        }
    });

    DungeonMap.prototype.constructor = DungeonMap;

    modules.dungeonMap = new DungeonMap();

})(modules.jQuery);