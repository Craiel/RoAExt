(function ($) {
    'use strict';

    var enabled = false;
    var autoToggleButton;
    var dungeonAutoActionTimer;

    function onAutoDungeon() {
        if(!enabled) {
            return;
        }

        continueAuto();
    }

    function continueAutoBattle() {
        // This room still has enemies, suggest fight
        modules.session.dungeonNeedsUpdate = true;

        var action = modules.createAutomateAction(modules.automateActionTypes.JQueryClick);
        action.control = '#dungeonEnemyList';
        action.findClause = '.dungeon_fight';
        modules.automateControl.add(action);
    }

    function continueAutoSearch() {
        // This room was not searched yet
        modules.session.dungeonNeedsUpdate = true;

        var action = modules.createAutomateAction(modules.automateActionTypes.JQueryClick);
        action.control = '#dungeonSearch';
        modules.automateControl.add(action);
    }

    function createMoveAction(direction) {
        var action = modules.createAutomateAction(modules.automateActionTypes.JQueryClick);
        action.control = '#dungeonNavigation';
        action.findClause = '[data-direction="'+ direction.stringValue +'"]';

        modules.automateControl.add(action);
    }

    function continueAutoMove(roomData) {
        // First check if we have somewhere to move that we have not been yet
        var availableUnexploredDirection = -1;
        for(var i = 0; i < 4; i++) {
            if(roomData.m[i] && !roomData.ml[i]) {
                availableUnexploredDirection = i;
                break;
            }
        }

        if(availableUnexploredDirection >= 0) {
            var directionToMove = modules.dungeonDirections.parseInt(availableUnexploredDirection);
            modules.session.dungeonNeedsUpdate = true;

            modules.logger.log("Dungeon Auto: Moving to unexplored cell on " + directionToMove.key);
            createMoveAction(directionToMove);

            return;
        }

        // Nowhere left to go, have to back-track
        var path = findTargetRoom(FindCondition.UnexploredNeighbor);
        if(path && path.length > 0) {
            modules.session.dungeonNeedsUpdate = true;

            for(var i = 0; i < path.length; i++) {
                var step = path[i];
                createMoveAction(modules.dungeonDirections.parseInt(step.dir));
            }

            // Finally add a delay action to give some time after the pathfinding
            var action = modules.createAutomateAction(modules.automateActionTypes.Delay);
            action.time = 500;
            modules.automateControl.add(action);
        } else {
            modules.logger.warn("Could not find Backtrack path!");
            enabled = false;
        }
    }

    var FindCondition = {
        UnexploredNeighbor: 0,
        Exit: 1,
        Id: 2
    };

    function constructPath(cameFrom, currentId) {
        var path = [];
        while (cameFrom[currentId]) {
            var dir = modules.dungeonDirections.parseInt(cameFrom[currentId].dir);
            path.push({to: cameFrom[currentId].id, dir: dir.id});

            console.log(dir.key + " -> " + currentId);

            currentId = cameFrom[currentId].id;
        }

        path = path.reverse();

        return path;
    }

    function findTargetRoom(condition, param) {
        var openSet = [modules.settings.settings.dungeonData.currentRoomId];
        var closedSet = [];
        var cameFrom = {};

        var score = {};

        // Set the initial score
        score[modules.settings.settings.dungeonData.currentRoomId] = 0;

        var maxIter = 300;
        var currIter = 0;
        while (openSet.length > 0) {
            currIter++;
            if(currIter >= maxIter) {
                console.error("findTargetRoom exceeded max iterations!");
                return;
            }

            var current = modules.settings.settings.dungeonData.rooms[openSet.pop()];
            switch (condition) {
                case FindCondition.UnexploredNeighbor: {
                    for(var i = 0; i < 4; i++) {
                        if(current.m[i] === 1 && !current.ml[i]) {
                            return constructPath(cameFrom, current.id);
                        }
                    }

                    break;
                }

                case FindCondition.Exit: {
                    if(current.m[4] === 1) {
                        return constructPath(cameFrom, current.id);
                    }

                    break;
                }

                case FindCondition.Id: {
                    if(current.id === param) {
                        return constructPath(cameFrom, current.id);
                    }

                    break;
                }
            }

            // This node does not satisfy, move on
            closedSet.push(current.id);
            for (var i = 0; i < 4; i++) {
                // See if we know where the direction leads to
                if(current.m[i] === 0 || !current.ml[i] || closedSet.includes(current.ml[i]) || openSet.includes(current.ml[i])) {
                    continue;
                }

                openSet.push(current.ml[i]);
                cameFrom[current.ml[i]] = {id: current.id, dir: i};
            }
        }
    }

    function continueAuto() {
        if(!modules.automateControl.isIdle()) {
            // There are still pending auto actions, nothing to do right now
            return;
        }

        if(modules.session.dungeonNeedsUpdate) {
            return;
        }

        if(!modules.settings.settings.dungeonData.currentRoomId) {
            // Dungeon room is not known yet
            return;
        }

        var roomData = modules.settings.settings.dungeonData.rooms[modules.settings.settings.dungeonData.currentRoomId];
        if(roomData.e.length > 0) {
            continueAutoBattle();
            return;
        }

        if(roomData.s) {
            continueAutoSearch();
            return;
        }

        continueAutoMove(roomData);
    }

    function toggleAuto() {
        enabled = !enabled;
        updateToggleText();

        // Clear any pending automation actions
        modules.automateControl.clear();
    }

    function updateToggleText() {
        var text = enabled ? "On" : "Off";
        autoToggleButton.text("Auto " + text);
    }

    function DungeonAutomate() {
        RoAModule.call(this, "Dungeon Automate");

        this.addDependency("dungeonTracker");
    }

    DungeonAutomate.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            autoToggleButton = $('<a></a>');
            autoToggleButton.click(toggleAuto);
            updateToggleText();

            var wrapper = $('<div class="bt1 mt10 center"></div>');
            wrapper.append(autoToggleButton);
            $('#dungeonInfo').append(wrapper);

            var manualContinueButton = $('<a>(A) Next</a>');
            manualContinueButton.click(continueAuto);

            var wrapper = $('<div class="bt1 mt10 center"></div>');
            wrapper.append(manualContinueButton);
            $('#dungeonInfo').append(wrapper);

            dungeonAutoActionTimer = modules.createInterval("DungeonAutoAction");
            dungeonAutoActionTimer.set(onAutoDungeon, 200);

            /*modules.ajaxHooks.register("dungeon_leave.php", onDungeonLeave);
            modules.ajaxHooks.register("dungeon_info.php", onDungeonInfo);
            modules.ajaxHooks.register("dungeon_search.php", onDungeonSearch);
            modules.ajaxHooks.register("dungeon_move.php", onDungeonMove);
            modules.ajaxHooks.register("dungeon_battle.php", onDungeonBattle);*/

            RoAModule.prototype.load.apply(this);
        }
    });

    DungeonAutomate.prototype.constructor = DungeonAutomate;

    modules.dungeonAutomate = new DungeonAutomate();

})(modules.jQuery);