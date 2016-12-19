(function () {
    'use strict';

    var nextId = 0;

    function GainTypeMap() {
        this.addType(new GainType('XP', 'XP'));
        this.addType(new GainType('ClanXP', 'Guild XP'));

        this.addType(new GainType('Gold', 'Gold'));
        this.addType(new GainType('ClanGold', 'Guild Gold'));

        this.addType(new GainType('Crystal', 'Crystal'));
        this.addType(new GainType('Platinum', 'Platinum'));
        this.addType(new GainType('Material', 'Material'));
        this.addType(new GainType('Fragment', 'Fragment'));
        this.addType(new GainType('Food', 'Food'));
        this.addType(new GainType('Wood', 'Wood'));
        this.addType(new GainType('Iron', 'Iron'));
        this.addType(new GainType('Stone', 'Stone'));

        this.addType(new GainType('Strength', 'Strength'));
        this.addType(new GainType('Health', 'Health'));
        this.addType(new GainType('Coordination', 'Coordination'));
        this.addType(new GainType('Agility', 'Agility'));
        this.addType(new GainType('Evasion', 'Evasion'));
        this.addType(new GainType('CounterAttack', 'Counter Attack'));
        this.addType(new GainType('Healing', 'Healing'));
        this.addType(new GainType('RangedWeapon', 'Ranged Weapon'));
        this.addType(new GainType('MeleeWeapon', 'Melee Weapon'));
        this.addType(new GainType('MagicalWeapon', 'Magical Weapon'));

        this.addType(new GainType('EventPoint', 'Event Point'));
        this.addType(new GainType('DungeonPoint', 'Dungeon Point'));

        this.addType(new GainType('Ingredient', 'Ingredient'));
        this.addType(new GainType('Item', 'Item'));
    }

    GainTypeMap.prototype = {
        types: {},
        addType: function (type) {
            if(this.types[type.key]) {
                console.error("Gain Type already defined: " + type.key);
            }

            this.types[type.key] = type;
        },
        parseInt: function (int) {
            for (var key in this.types) {
                var type = this.types[key];
                if (type.id == int) {
                    return type;
                }
            }

            console.warn("Unknown Gain Type: " + int);
        },
        parse: function (str, matchInclude) {
            matchInclude = matchInclude || false;
            for (var key in this.types) {
                var type = this.types[key];
                if(type.stringValue == str) {
                    return type;
                } else if (matchInclude && str.includes(type.stringValue)) {
                    return type;
                }
            }

            console.warn("Unknown Gain Type: " + str);
        }
    };

    GainTypeMap.prototype.constructor = GainTypeMap;

    function GainType(key, stringValue) {
        this.name = "GTYP_" + key;
        this.key = key;
        this.id = nextId++;
        this.stringValue = stringValue;
    }

    GainType.prototype = {
        name: "",
        key: null,
        id: null,
        stringValue: ""
    };

    GainType.prototype.constructor = GainType;

    modules.gainTypes = new GainTypeMap();

})();