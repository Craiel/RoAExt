(function ($) {
    'use strict';

    modules.chartTimeScale = {
        Hour: {title: "Hours"},
        Day: {title: "Days"},
        Month: {title: "Months"}
    };

    const Chart = function (toggleDiv, targetDiv, title, type) {
        this.id = targetDiv;
        this.data = modules.createChartData();
        this.initialize(toggleDiv, targetDiv, title, type);
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
        scale: modules.chartTimeScale.Hour,
        data: null,
        initialize: function (toggleDiv, targetDiv, title, type) {
            var type = type || "line";
            this.toggleDiv = $('#' + toggleDiv);
            this.toggleDiv.click({self: this}, function(evt) { evt.data.self.show(); });

            this.targetDiv = $('#' + targetDiv);

            this.control = new CanvasJS.Chart(targetDiv, {
                title:{
                    text: title
                },
                data: [
                    {
                        type: type,
                        color: "blue",
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

            //console.log("Showing Chart " + this.id);
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

            //console.log("Hiding Chart " + this.id);
            this.visible = false;
            this.updateControlState();
            this.render();
        },
        updateChartData: function () {
            var newData = this.data.getData(this.scale);

            this.control.options.data[0].dataPoints = [];
            for(var i = 0; i < newData.length; i++) {
                this.control.options.data[0].dataPoints.push({label: modules.utils.pad(newData[i][0], 2), x: i, y: newData[i][1]});
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
            if(dataPoint == null || isNaN(dataPoint)) {
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

            return this;
        },
        asAdditive: function () {
            this.data.additive = true;

            return this;
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

    modules.createChart = function (toggleDiv, targetDiv, title, type) {
        return new Chart(toggleDiv, targetDiv, title, type);
    };

})(modules.jQuery);