(function () {

    function DungeonDirectionMap() {
        // Create the map of directions
        this.addDirection(new DungeonDirection("East", 0, "east", 2));
        this.addDirection(new DungeonDirection("North", 1, "north", 3));
        this.addDirection(new DungeonDirection("West", 2, "west", 0));
        this.addDirection(new DungeonDirection("South", 3, "south", 1));

        // Set the opposites
        this.rebuildOpposites();
    }

    DungeonDirectionMap.prototype = Object.spawn(RoAModule.prototype, {
        directions: {},
        addDirection: function (direction) {
            if(this.directions[direction.key]) {
                console.error("Dungeon Direction already defined: " + direction.key);
            }

            this.directions[direction.key] = direction;
        },
        parseInt: function (int) {
            for (var key in this.directions) {
                var direction = this.directions[key];
                if (direction.id == int) {
                    return direction;
                }
            }

            console.warn("Unknown Movement Direction: " + int);
        },
        parse: function (str, matchInclude) {
            matchInclude = matchInclude || false;
            for (var key in this.directions) {
                var direction = this.directions[key];
                if(direction.stringValue == str) {
                    return direction;
                } else if (matchInclude && str.includes(direction.stringValue)) {
                    return direction;
                }
            }

            console.warn("Unknown Movement Direction: " + str);
        },
        rebuildOpposites: function () {
            for (var key in this.directions) {
                this.directions[key].opposite = this.parseInt(this.directions[key].oppositeId);
            }
        }
    });

    DungeonDirectionMap.prototype.constructor = DungeonDirectionMap;

    function DungeonDirection(key, id, stringValue, oppositeId) {
        this.name = "DIR_" + key;
        this.key = key;
        this.id = id;
        this.stringValue = stringValue;
        this.oppositeId = oppositeId;
    }

    DungeonDirection.prototype = Object.spawn(RoAModule.prototype, {
        key: null,
        id: null,
        stringValue: "",
        opposite: null,
        oppositeId: null
    });

    DungeonDirection.prototype.constructor = DungeonDirection;

    modules.dungeonDirections = new DungeonDirectionMap();

})();