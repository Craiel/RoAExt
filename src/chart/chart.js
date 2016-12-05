(function ($) {
    'use strict';

    modules.chartTimeScale = {
        Minute: {title: "Minutes"},
        Hour: {title: "Hours"},
        Day: {title: "Days"},
        Month: {title: "Months"}
    };

    const CURRENT_STORAGE_VERSION = 1;

    const ChartData = function () {
        this.reset();
    };

    ChartData.prototype = {
        storage: null,
        addDataPoint: function(dataPoint) {
            var dataPointTime = new Date();

            var dataPointMinute = dataPointTime.getMinutes();
            var dataPointHour = dataPointTime.getHours();
            var dataPointDay = dataPointTime.getDay();
            var dataPointMonth = dataPointTime.getMonth();

            this.addData("mi", dataPointMinute, dataPoint, 60 * 12); // 1/2 day
            this.addData("h", dataPointHour, dataPoint, 24 * 30); // 30 days
            this.addData("d", dataPointDay, dataPoint, 356); // 1 year
            this.addData("mo", dataPointMonth, dataPoint, 12 * 5); // 5 years
        },
        addData: function (key, id, value, limit) {
            if(!this.storage[key]) {
                this.storage[key] = [];
            }

            if(this.storage[key].length > 0 && this.storage[key][this.storage[key].length - 1].x === id) {
                return;
            }

            this.storage[key].push([id, value]);
            if(this.storage[key].length > limit) {
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
            this.storage = {version:CURRENT_STORAGE_VERSION, mi: [], h:[], d:[], mo:[]};
        },
        getData: function (scale) {
            if(scale === modules.chartTimeScale.Minute) {
                return this.storage.mi;
            } else if (scale === modules.chartTimeScale.Hour) {
                return this.storage.h;
            } else if (scale === modules.chartTimeScale.Day) {
                return this.storage.d;
            } else if (scale === modules.chartTimeScale.Month) {
                return this.storage.mo;
            }
        }
    };

    const Chart = function (toggleDiv, targetDiv, title) {
        this.id = targetDiv;
        this.data = new ChartData();
        this.initialize(toggleDiv, targetDiv, title);
    };

    Chart.prototype = {
        id: "ERR",
        visible: false,
        onBecameVisible: null,
        toggle: null,
        target: null,
        isGameStatChart: false,
        isElementChart: false,
        gameStatDataPoint: null,
        elementDataPoint: null,
        scale: modules.chartTimeScale.Minute,
        data: null,
        initialize: function (toggleDiv, targetDiv, title) {
            this.toggleDiv = $('#' + toggleDiv);
            this.toggleDiv.click({self: this}, function(evt) { evt.data.self.show(); });

            this.targetDiv = $('#' + targetDiv);

            this.control = new CanvasJS.Chart(targetDiv, {
                title:{
                    text: title
                },
                data: [
                    {
                        type: "line",
                        dataPoints: []
                    }
                ],
                axisX:{
                    title : "Time",
                },

                axisY:{
                    title : "Value",
                },
            });

            this.updateControlState();
        },
        load: function (data) {
            this.data.load(data);
            this.updateChartData();
            this.render();
        },
        save: function () {
            return this.data.save();
        },
        reset: function () {
            this.data.reset();
            this.updateChartData();
            this.render();
        },
        show: function () {
            if(this.visible === true) {
                return;
            }

            console.log("Showing Chart " + this.id);
            this.visible = true;
            this.updateControlState();
            this.render();

            if(this.onBecameVisible) {
                this.onBecameVisible(this.id);
            }
        },
        hide: function () {
            if(this.visible === false) {
                return;
            }

            console.log("Hiding Chart " + this.id);
            this.visible = false;
            this.updateControlState();
            this.render();
        },
        updateChartData: function () {
            var newData = this.data.getData(this.scale);

            this.control.options.data[0].dataPoints = [];
            for(var i = 0; i < newData.length; i++) {
                this.control.options.data[0].dataPoints.push({title: modules.utils.pad(newData[i][0], 2), x: i, y: newData[i][1]});
            }

            this.updateChartAxis();
        },
        updateChartAxis: function () {
            var controlData = this.control.options.data[0].dataPoints;

            // Rebuild min / max based on the new chart values
            var min = null;
            var max = null;

            for (var i = 0; i < controlData.length; i++) {
                if(min === null || min > controlData[i].y) {
                    min = controlData[i].y;
                }

                if(max === null || max < controlData[i].y) {
                    max = controlData[i].y;
                }
            }

            this.control.options.axisY.minimum = min;
            this.control.options.axisY.maximum = max;

            this.control.options.axisX.title = this.scale.title;
        },
        updateData: function (dataPoint) {
            if(dataPoint == null || dataPoint == NaN) {
                return
            }

            this.data.addDataPoint(dataPoint);

            this.updateChartData();
        },
        updateDataFromGameStats: function (stats) {
            if(!this.isGameStatChart) {
                return;
            }

            this.updateData(stats[this.gameStatDataPoint]);
        },
        updateDataFromElement: function() {
            var value = modules.utils.getElementIntValue(this.elementDataPoint);
            this.updateData(value);
        },
        asGameStatChart: function (dataPoint) {
            this.isGameStatChart = true;
            this.gameStatDataPoint = dataPoint;

            return this;
        },
        asElementChart: function (dataPoint) {
            this.isElementChart = true;
            this.elementDataPoint = dataPoint;
        },
        updateControlState: function() {
            if(this.visible === false) {
                this.targetDiv.hide();
                return;
            }

            this.targetDiv.show();
        },
        render: function () {
            this.control.render();
        },
        setTimeScale: function (newScale) {
            this.scale = newScale;
            this.updateChartData();
            this.render();
        }
    };

    modules.createChart = function (toggleDiv, targetDiv, title) {
        return new Chart(toggleDiv, targetDiv, title);
    };

})(modules.jQuery);