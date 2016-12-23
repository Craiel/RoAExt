(function () {
    'use strict';

    const GainDataVersion = 2;
    const StorageTimeLimit = 24 * 60 * 60 * 1000; // track the value over 24 hours
    const PerHourUpdateInterval = 60 * 1000; // update every minute
    const PerHourTime = 60 * 60 * 1000;

    const GainData = function () {
        this.reset();
    };

    GainData.prototype = {
        storage: null,
        perHour: 0.0,
        perHourAbs: 0.0,
        lastUpdate: Date.now(),
        entriesSinceLastUpdate: 0,
        valueSinceLastUpdate: 0,
        initialize: function() {
            if(!this.storage || this.storage.version !== GainDataVersion) {
                this.storage = { version: GainDataVersion, t: 0, tc: 0, e: [], s: {}};
            }
        },
        addData: function (value, source) {
            if(!value || isNaN(value) || value === 0) {
                // Ignore empty or zero entries
                return;
            }

            var time = Date.now();
            this.storage.t += value;
            this.storage.tc++;
            this.storage.e.unshift({v: value, t: time});

            while(this.storage.e.length > 0 && time - this.storage.e[this.storage.e.length - 1].t > StorageTimeLimit) {
                var oldEntry = this.storage.pop();
                this.storage.t -= oldEntry.v;
            }

            // Add the value to by source tracking if specified
            if (source !== null) {
                if (this.storage.s[source] === null || isNaN(this.storage.s[source])) {
                    this.storage.s[source] = 0;
                }

                this.storage.s[source] += value;
            }

            this.entriesSinceLastUpdate++;
            this.valueSinceLastUpdate += value;
        },
        load: function (data) {
            this.storage = JSON.parse(data);
            if(this.storage.version !== GainDataVersion) {
                console.warn("Gain data is too old and was reset!");
                this.reset();
            }
        },
        save: function () {
            return JSON.stringify(this.storage);
        },
        reset: function () {
            this.storage = null;
            this.initialize();

            this.perHour = 0.0;
            this.perHourAbs = 0.0;
            this.lastUpdate = Date.now();
            this.entriesSinceLastUpdate = 0;
            this.valueSinceLastUpdate = 0;
        },
        update: function () {
            if(!this.storage) {
                return;
            }

            var time = Date.now();
            var elapsed = time - this.lastUpdate;
            if(elapsed >= PerHourUpdateInterval) {
                if(this.storage.e.length > 0) {
                    var elapsedTotal = time - this.storage.e[this.storage.e.length - 1].t;
                    var hours = elapsedTotal / PerHourTime;
                    this.perHourAbs = this.storage.t / hours;
                }

                this.perHour = (this.valueSinceLastUpdate / (elapsed / 1000)) * 60 * 60;
                this.valueSinceLastUpdate = 0;
                this.entriesSinceLastUpdate = 0;
                this.lastUpdate = time;
            }
        },
        getEntryCount: function () {
            return this.storage.tc;
        },
        getValue: function () {
            return this.storage.t;
        },
        getFilteredValue: function (sourceIdArray) {
            var result = 0;
            for (var i = 0; i < sourceIdArray.length; i++) {
                var id = isNaN(sourceIdArray[i]) ? parseInt(sourceIdArray[i]) : sourceIdArray[i];
                if(this.storage.s[id]) {
                    result += this.storage.s[id];
                }
            }

            return result;
        },
        getCurrentPerHourValue: function () {
            return this.perHour;
        },
        getAbsolutePerHourValue: function () {
            return this.perHourAbs;
        }
    };

    modules.createGainData = function () {
        return new GainData();
    };

})();