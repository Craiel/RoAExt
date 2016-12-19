(function () {
    'use strict';

    const CURRENT_STORAGE_VERSION = 1;

    const ChartData = function () {
        this.reset();
    };

    ChartData.prototype = {
        storage: null,
        additive: false,
        addDataPoint: function(dataPoint) {
            var dataPointTime = new Date();

            var dataPointMinute = dataPointTime.getMinutes();
            var dataPointHour = dataPointTime.getHours();
            var dataPointDay = dataPointTime.getDate();
            var dataPointMonth = dataPointTime.getMonth() + 1;

            this.addData("h", dataPointHour, dataPoint, 24 * 30); // 30 days
            this.addData("d", dataPointDay, dataPoint, 356); // 1 year
            this.addData("mo", dataPointMonth, dataPoint, 12 * 5); // 5 years
        },
        addData: function (key, id, value, limit) {
            if(!this.storage[key]) {
                this.storage[key] = [];
            }

            if(this.storage[key].length > 0) {
                var existingEntry = this.storage[key][this.storage[key].length - 1];
                if (existingEntry[0] === id) {
                    if (this.additive) {
                        // We are additive so add the y values
                        existingEntry[1] += value;
                    }

                    return;
                }
            }

            this.storage[key].push([id, value]);
            while (this.storage[key].length > limit) {
                this.storage[key].shift();
            }
        },
        load: function (data) {
            this.storage = JSON.parse(data);
            if(this.storage.version !== CURRENT_STORAGE_VERSION) {
                console.warn("Chart data is too old and was reset!");
                this.reset();
            }
        },
        save: function () {
            return JSON.stringify(this.storage);
        },
        reset: function () {
            this.storage = {version:CURRENT_STORAGE_VERSION, h:[], d:[], mo:[]};
        },
        getData: function (scale) {
            if (scale === modules.chartTimeScale.Hour) {
                return this.storage.h;
            } else if (scale === modules.chartTimeScale.Day) {
                return this.storage.d;
            } else if (scale === modules.chartTimeScale.Month) {
                return this.storage.mo;
            }
        }
    };

    modules.createChartData = function () {
        return new ChartData();
    };

})();