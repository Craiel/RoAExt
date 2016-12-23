﻿modules.templates = {
	centerContentWindow: '<div class="ui-element currentPage" style="margin-top: 10px">     <h5 class="center toprounder15"><span>%TITLE%</span></h5>     <div class="mCustomScrollbar _mCS_18 mCS-autoHide ui-resizable mCS_no_scrollbar">         <div id="%ID%_content_wrapper" class="mCustomScrollBox mCS-light mCSB_vertical mCSB_inside" tabindex="0">             <div id="%ID%_content" class="mCSB_container mCS_y_hidden mCS_no_scrollbar_y" style="position:relative; top:0; left:0;" dir="ltr">             </div>         </div>         <div class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>         <div class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>         <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90;"></div>     </div> </div>',
	chartWindow: '<div id="gameCharts" class="border2 ui-component roaext-chart-window">     <div id="gameChartWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="gameChartTitle" class="center toprounder">Charts</h5>         <span class="closeModal"><a id="gameChartWindowClose">×</a></span>         <div id="gameChartContent" class="mCSB_container" style="height: 100%">             <div id="gameChartControls" class="col-xs-12 col-md-12 center mt10" style="display: block">                 <div id="gameChartReset" class="btn btn-primary">Reset</div>                 <div id="gameChartRedraw" class="btn btn-primary">Redraw</div>                 <div id="gameChartDebugData" class="btn btn-primary">Debug</div>                 <div id="gameChartTimeHour" class="btn btn-primary">Hour</div>                 <div id="gameChartTimeDay" class="btn btn-primary">Day</div>                 <div id="gameChartTimeMonth" class="btn btn-primary">Month</div>                 <div id="gameChartStorageSizeWrapper" style="display: inline-block">                     <span>Storage Size: </span>                     <span id="gameChartStorageSize">0</span>                     <span>bytes</span>                 </div>             </div>             <div id="gameroaext-chart-category-tabs" style="height: 100%">                 <div class="col-xs-12 col-md-12 mt10" style="display: block">                     <div id="toggleGameChartPlayer" class="btn btn-primary">Player Charts</div>                     <div id="toggleGameChartStats" class="btn btn-primary">Game Stats</div>                     <div id="toggleGameChartMarket" class="btn btn-primary">Market</div>                 </div>                 <div id="gameChartPlayerTabs" class="roaext-chart-category-tab">                     <div class="col-xs-12 col-md-12 mt10" style="display: block">                         <div id="toggleChartPlayerBattleXP" class="btn btn-primary">Battle XP</div>                         <div id="toggleChartPlayerHarvestXP" class="btn btn-primary">Harvest XP</div>                         <div id="toggleChartPlayerCraftingXP" class="btn btn-primary">Crafting XP</div>                         <div id="toggleChartPlayerGold" class="btn btn-primary">Gold</div>                         <div id="toggleChartPlayerGoldLooted" class="btn btn-primary">Gold Looted</div>                         <div id="toggleChartPlayerPlatinum" class="btn btn-primary">Platinum</div>                         <div id="toggleChartPlayerCrystal" class="btn btn-primary">Crystals</div>                         <div id="toggleChartPlayerMaterial" class="btn btn-primary">Material</div>                         <div id="toggleChartPlayerFragment" class="btn btn-primary">Fragments</div>                         <div id="toggleChartPlayerFood" class="btn btn-primary">Food</div>                         <div id="toggleChartPlayerWood" class="btn btn-primary">Wood</div>                         <div id="toggleChartPlayerIron" class="btn btn-primary">Iron</div>                         <div id="toggleChartPlayerStone" class="btn btn-primary">Stone</div>                     </div>                     <div id="chartPlayerBattleXP" class="roaext-chart-tab"></div>                     <div id="chartPlayerHarvestXP" class="roaext-chart-tab"></div>                     <div id="chartPlayerCraftingXP" class="roaext-chart-tab"></div>                     <div id="chartPlayerGold" class="roaext-chart-tab"></div>                     <div id="chartPlayerGoldLooted" class="roaext-chart-tab"></div>                     <div id="chartPlayerPlatinum" class="roaext-chart-tab"></div>                     <div id="chartPlayerCrystal" class="roaext-chart-tab"></div>                     <div id="chartPlayerMaterial" class="roaext-chart-tab"></div>                     <div id="chartPlayerFragment" class="roaext-chart-tab"></div>                     <div id="chartPlayerFood" class="roaext-chart-tab"></div>                     <div id="chartPlayerWood" class="roaext-chart-tab"></div>                     <div id="chartPlayerIron" class="roaext-chart-tab"></div>                     <div id="chartPlayerStone" class="roaext-chart-tab"></div>                 </div>                 <div id="gameChartStatsTabs" class="roaext-chart-category-tab">                     <div class="col-xs-12 col-md-12 mt10" style="display: block">                         <div id="toggleChartMonsterSlain" class="btn btn-primary">Monsters Slain</div>                         <div id="toggleChartGoldLooted" class="btn btn-primary">Gold Looted</div>                         <div id="toggleChartGoldInGame" class="btn btn-primary">Gold in Game</div>                         <div id="toggleChartResourcesInGame" class="btn btn-primary">Resources in Game</div>                         <div id="toggleChartPlatinumInGame" class="btn btn-primary">Platinum in Game</div>                         <div id="toggleChartMaterialInGame" class="btn btn-primary">Material in Game</div>                         <div id="toggleChartFragmentInGame" class="btn btn-primary">Fragments in Game</div>                         <div id="toggleChartHarvests" class="btn btn-primary">Harvests</div>                         <div id="toggleChartResourcesHarvested" class="btn btn-primary">Resources Harvested</div>                         <div id="toggleChartItemsFound" class="btn btn-primary">Items Found</div>                     </div>                     <div id="chartMonsterSlain" class="roaext-chart-tab"></div>                     <div id="chartGoldLooted" class="roaext-chart-tab"></div>                     <div id="chartGoldInGame" class="roaext-chart-tab"></div>                     <div id="chartResourcesInGame" class="roaext-chart-tab"></div>                     <div id="chartPlatinumInGame" class="roaext-chart-tab"></div>                     <div id="chartMaterialInGame" class="roaext-chart-tab"></div>                     <div id="chartFragmentInGame" class="roaext-chart-tab"></div>                     <div id="chartHarvests" class="roaext-chart-tab"></div>                     <div id="chartResourcesHarvested" class="roaext-chart-tab"></div>                     <div id="chartItemsFound" class="roaext-chart-tab"></div>                 </div>                 <div id="gameChartMarketTabs" class="roaext-chart-category-tab">                     <div class="col-xs-12 col-md-12 mt10" style="display: block">                         <div id="toggleChartMarketCrystals" class="btn btn-primary">Crystals</div>                         <div id="toggleChartMarketPlatinum" class="btn btn-primary">Platinum</div>                         <div id="toggleChartMarketFood" class="btn btn-primary">Food</div>                         <div id="toggleChartMarketWood" class="btn btn-primary">Wood</div>                         <div id="toggleChartMarketIron" class="btn btn-primary">Iron</div>                         <div id="toggleChartMarketStone" class="btn btn-primary">Stone</div>                         <div id="toggleChartMarketMaterial" class="btn btn-primary">Material</div>                         <div id="toggleChartMarketFragment" class="btn btn-primary">Fragments</div>                     </div>                     <div id="chartMarketCrystals" class="roaext-chart-tab"></div>                     <div id="chartMarketPlatinum" class="roaext-chart-tab"></div>                     <div id="chartMarketFood" class="roaext-chart-tab"></div>                     <div id="chartMarketWood" class="roaext-chart-tab"></div>                     <div id="chartMarketIron" class="roaext-chart-tab"></div>                     <div id="chartMarketStone" class="roaext-chart-tab"></div>                     <div id="chartMarketMaterial" class="roaext-chart-tab"></div>                     <div id="chartMarketFragment" class="roaext-chart-tab"></div>                 </div>             </div>         </div>     </div> </div>',
	clanDonationPercent: '<label style="display: block; padding-left: 15px; text-indent: -15px; margin-top:-25px">     <input type="checkbox" id="toggleDonationPercent" style="width: 13px; height: 13px; padding: 0; margin: 0; vertical-align: bottom; position: relative; top: -3px; *overflow: hidden;" />     Show % </label>',
	debugWindow: '<div id="debug" class="border2 ui-component roaext-debug-window">     <div id="debugWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="debugWindowTitle" class="center toprounder">Debug</h5>         <span class="closeModal"><a id="debugWindowClose">×</a></span>         <div id="debugWindowContent" class="mCSB_container roaext-debug-window-content" style="height: 100%">             <table id="debugWindowTable" class="sorted_table">                 <thead>                 <tr>                     <th colspan="3">                         Request History                     </th>                 </tr>                 <tr>                     <th>Url</th>                     <th>Time</th>                     <th>Data Sent</th>                     <th>Data Received</th>                 </tr>                 </thead>                 <tbody id="debugWindowContentBody">                 </tbody>             </table>         </div>     </div> </div>',
	dungeonWindow: '<div id="roaDungeon" class="border2 ui-component roaext-dungeon-window">     <div id="dungeonWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="dungeonWindowTitle" class="center toprounder">Dungeon</h5>         <span class="closeModal"><a id="dungeonWindowClose">×</a></span>         <div id="dungeonWindowContent" class="mCSB_container roaext-dungeon-window-content" style="height: 100%">             <div id="dungeonLinksWrapper" class="center">                 <a id="dungeonCtrlMap" class="active"><button class="btn btn-primary">Map</button></a>                 <a id="dungeonCtrlStatistics" class=""><button class="btn btn-primary">Statistics</button></a>                 <a id="dungeonCtrlData" class=""><button class="btn btn-primary">Data</button></a>             </div>             <div id="dungeonWndMap"></div>             <div id="dungeonWndStatistics" style="margin-top: 20px; width: 60%; margin-left: 20%;">                 <table id="dungeonWndStatisticsTable" class="sorted_table" style="width: 100%;">                     <thead>                     <tr>                         <th>Name</th>                         <th>Value</th>                     </tr>                     </thead>                     <tbody id="dungeonWndStatisticsTableContent">                     </tbody>                 </table>             </div>             <div id="dungeonWndData" style="margin-top: 20px">                 <div class="center">                     <span id="dungeonDataSize"></span>                 </div>                 <div class="center">                     <a id="dungeonResetDataBtn"><button class="btn btn-primary">Reset</button></a>                 </div>             </div>         </div>     </div> </div>',
	milestoneBar: '<div class="milestoneBarWrapper" style="padding: 0px;">     <div class="milestoneBarName">%NAME%</div>     <div class="milestoneBarProgressText">%VALUECUR% / %VALUEMAX% (%PROGRESS%%), %REWARD%</div>     <div class="milestoneBarFillComplete" style="width: %PROGRESS%%"></div>     <div class="milestoneBarFillIncomplete"></div>     <div style="clear: both;"></div> </div>',
	noteWindow: '<div id="notes" class="border2 ui-component roaext-note-window">     <div id="noteWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="noteTitle" class="center toprounder">Notes</h5>         <span class="closeModal"><a id="noteWindowClose">×</a></span>         <div id="noteContent" class="mCSB_container" style="height: 100%">             <div id="noteEditor"></div>         </div>     </div> </div>',
	perHourGain: '<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: %COLOR%; font-size: %SIZE%">     <td id="%ID%" colspan="2" style="text-align: center;"></td> </tr>',
	playerGainWindow: '<div id="roaPlayerGains" class="border2 ui-component roaext-gain-window">     <div id="gainWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="gainWindowTitle" class="center toprounder">Gains & Loot</h5>         <span class="closeModal"><a id="gainWindowClose">×</a></span>         <div id="gainWindowContent" class="mCSB_container roaext-gain-window-content" style="height: 100%">             <div id="dungeonLinksWrapper" class="center">                 <a id="gainCtrlList" class="active"><button class="btn btn-primary">List</button></a>                 <a id="gainCtrlDropMap" class=""><button class="btn btn-primary">Drop Map</button></a>             </div>             <div id="gainWndList" style="margin: 10px;">                 <h5 class="center">Source Filters</h5>                 <div id="gainSourceFilters" class="center" style="margin-top: 10px; margin-bottom: 20px;"></div>                 <h5 class="center">Type Filters</h5>                 <div id="gainTypeFilters" class="center" style="margin-bottom: 20px;"></div>                 <div id="gainControls" class="col-xs-12 col-md-12 center mt10" style="margin-bottom: 20px; display: block"></div>                 <div id="gainContentTableWrapper">                     <table id="gainContentTable" class="sorted_table" style="width: 90%; margin: 20px;">                         <thead>                         <tr>                             <th>Id</th>                             <th>Type</th>                             <th>Count</th>                             <th>Amount</th>                             <th>Average</th>                             <th>#/hour</th>                             <th>#/hour (over 24h)</th>                         </tr>                         </thead>                         <tbody id="gainContentTableBody">                         </tbody>                     </table>                 </div>             </div>             <div id="gainWndDropMap" style="margin-top: 20px">                 <div class="center">                     <label>Filter by Drop: <input id="gainDropMapFilterDropValue" class="roaext-gain-drop-filter-input"/></label>                     <label style="margin-left: 20px">Filter by Source: <input id="gainDropMapFilterSourceValue" class="roaext-gain-drop-filter-input"/></label>                 </div>                 <table id="gainWndDropMapTable" class="sorted_table" style="width: 80%; margin-left: 10%">                     <thead>                     <tr>                         <th>Item</th>                         <th>Source</th>                     </tr>                     </thead>                     <tbody id="gainWndDropMapTableContent">                     </tbody>                 </table>             </div>         </div>     </div> </div>',
	scriptMenu: '<div id="roaext" style="margin-bottom: 10px">     <div class="ui-element border2">         <h5 id="roaMenuTitle" class="toprounder center active"></h5>         <ul id="roaMenuContent" class="roaext-menu-content">         </ul>     </div> </div>',
	settingsWindow: '<div id="roaextSettings" class="border2 ui-component roaext-settings-window">     <div id="settingsWindow" class="ui-element border2 roaext-module-window-content">         <h5 id="settingsWindowTitle" class="center toprounder">Settings</h5>         <span class="closeModal"><a id="settingsWindowClose">×</a></span>         <div id="settingsWindowContent" class="mCSB_container roaext-settings-window-content" style="height: 100%">         </div>     </div> </div>',
	timerEditor: '<div id="timerEditor" class="border2 ui-component roaext-time-editor-window">     <div id="timerEditorWindow" class="ui-element border2" style="height: 100%">         <h5 id="timerEditorTitle" class="center toprounder">Create Timer</h5>         <span class="closeModal"><a id="timerEditorWindowClose">×</a></span>         <div id="timerEditorContent" class="mCSB_container" style="height: 100%">             <div id="activeCustomTimers">                 <table class="roaext" style="margin:auto">                     <thead>                     <tr>                         <th colspan="3">                             Active Timers                         </th>                     </tr>                     <tr>                         <th>Name</th>                         <th>Time</th>                         <th>Options</th>                     </tr>                     </thead>                     <tbody id="activeCustomTimerTableContent">                     </tbody>                 </table>             </div>             <div id="createNewCustomTimer" style="margin-top: 10px">                 <table class="roaext" style="margin:auto">                     <tr>                         <th>                             <input id="customTimerOptName" class="roaext-timer-input"> Name</input>                         </th>                         <th>                             <input id="customTimerOptHour" class="roaext-timer-input-time" maxlength="2"> H</input>                             <input id="customTimerOptMinute" class="roaext-timer-input-time" maxlength="2"> M</input>                             <input id="customTimerOptSecond" class="roaext-timer-input-time" maxlength="2"> S</input>                         </th>                         <th>                             <input id="customTimerOptSound" type="checkbox" class="roaext-timer-checkbox">Sound</input>                             <input id="customTimerOptNotify" type="checkbox" class="roaext-timer-checkbox">Notification</input>                         </th>                         <th>                             <a id="customTimerCreateButton">Create</a>                         </th>                     </tr>                 </table>             </div>             <div id="createTimerFeedback" class="roaext-timer-feedback">             </div>         </div>     </div> </div>',
	timerMenu: '<div id="timerMenu" style="margin-top: 10px">     <div class="ui-element border2">         <h5 class="toprounder center"><a id="timerEditorOpen" href="javascript:;" style="text-decoration: none!important;">Timers</a></h5>         <div id="timerMenuContents" class="row">         </div>     </div> </div>'

};