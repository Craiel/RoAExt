(function () {
    'use strict';

    var nextId = 0;

    function GainSourceMap() {
        this.addSource(new GainSource('Battle', 'Battle'));
        this.addSource(new GainSource('Tradeskill', 'Tradeskill'));
        this.addSource(new GainSource('Crafting', 'Crafting'));
        this.addSource(new GainSource('Dungeon', 'Dungeon'));
        this.addSource(new GainSource('ActivityDrop', 'Activity Drop'));
        this.addSource(new GainSource('TrashCompactor', 'Trash Compactor'));
        this.addSource(new GainSource('DungeonSearch', 'Dungeon Search'));
    }

    GainSourceMap.prototype = {
        sources: {},
        addSource: function (source) {
            if(this.sources[source.key]) {
                console.error("Gain Source already defined: " + source.key);
            }

            this.sources[source.key] = source;
        },
        parseInt: function (int) {
            for (var key in this.sources) {
                var source = this.sources[key];
                if (source.id == int) {
                    return source;
                }
            }

            console.warn("Unknown Gain Source: " + int);
        },
        parse: function (str, matchInclude) {
            matchInclude = matchInclude || false;
            for (var key in this.sources) {
                var source = this.sources[key];
                if(source.stringValue == str) {
                    return source;
                } else if (matchInclude && str.includes(source.stringValue)) {
                    return source;
                }
            }

            console.warn("Unknown Gain Source: " + str);
        }
    };

    GainSourceMap.prototype.constructor = GainSourceMap;

    function GainSource(key, stringValue) {
        this.name = "GSRC_" + key;
        this.key = key;
        this.id = nextId++;
        this.stringValue = stringValue;
    }

    GainSource.prototype = {
        name: "",
        key: null,
        id: null,
        stringValue: ""
    };

    GainSource.prototype.constructor = GainSource;

    modules.gainSources = new GainSourceMap();

})();