(function ($) {

    function createDomElements() {
        // settings
        $(modules.templates.chatTabSettingsWindow).appendTo("body");
        var settingsWindow = $("#ToASettingsWindow");
        settingsWindow.hide();
        settingsWindow.draggable({handle:"h5"});
        $("#ToASettingsScriptSettings").hide();
        $("#ToASettingsChannelMerger").hide();
    }

    function loadAllChannels() {
        $("#chatChannel option").each(function(i,e){
            var channelName = $(e).text();
            modules.chatTabsCore.forceLoadChannel(channelName);
        });

        modules.chatTabsCore.forceLoadChannelExplicit("GLOBAL", modules.chatTabsConstants.GlobalChannel, modules.chatTabsCore.getChannelColor(modules.chatTabsConstants.GlobalChannel, "Global"));
        modules.chatTabsCore.forceLoadChannelExplicit("Event", modules.chatTabsConstants.EventChannel, modules.chatTabsCore.getChannelColor(modules.chatTabsConstants.EventChannel, "Event"));
    }

    function addChannelGroup(i, name) {
        var mcgw = $("<div>").addClass("border2 incsort input-group");

        var mcgigb = $("<div>").addClass("input-group-btn");

        var mcgdb = $("<button>").addClass("ToASChMChGRemove btn btn-primary btn-xs ruby");
        var mcgn = $("<input>").attr({type:"text",name:"mcg_cn"}).addClass("ToASChMmcgName");

        var mcgID = modules.chatTabsConstants.Channels.Merged + "_MCGID_" + modules.chatTabsConstants.ChannelNameMap[name];
        var wrapper = mcgw.clone().attr({"id": mcgID,"data-group": name}).appendTo("#ToASChMMergedChannelsGroupsHolder");

        var igb = mcgigb.clone().appendTo(wrapper);
        mcgdb.clone().attr("data-gnid", i).html("<i class=\"fa fa-times\"></i>").appendTo(igb);
        mcgn.clone().val(name).attr("data-gnid", i).appendTo(wrapper);
    }

    function onTabSettings() {
        $("#modalBackground").show();
        $("#ToASettingsWindow").show();

        loadAllChannels();

        // load muted channel
        var mchw = $("<span>").addClass("ChMChannelWrapper border2");
        var mchx = $("<span>").addClass("ChMMChX ui-element fa fa-times ruby");

        $("#ToASChMMutedChannelsHolder").html("");
        $("#ToASChMMergedChannelsHolder").html("");
        $("#ToASChMMergedChannelsGroupsHolder").html("");
        var channelName = "";
        for (var i in modules.settings.settings.chat.channels.mutedChannels) {
            channelName = modules.settings.settings.chat.channels.mutedChannels[i];
            var holder      = mchw.clone().append(channelName).appendTo("#ToASChMMutedChannelsHolder");
            mchx.clone().attr("data-channel", channelName).prependTo(holder);
        }

        channelName = "";

        $("#ToASChMMergedChannelsGroupsHolder").html("");
        for (var j in modules.settings.settings.chat.channels.merger.groups){
            var mcggn = modules.settings.settings.chat.channels.merger.groups[j];
            addChannelGroup(j, mcggn);
        }

        for (var channelId in modules.chatTabsCore.getActiveChannels()) {
            if (!channelId.match(/^[0-9]+$/)) {
                continue;
            }

            var channelInfo = modules.chatTabsCore.getChannelInfo(channelId);
            if (typeof channelInfo === "undefined") {
                continue;
            }

            channelName = channelInfo.channelName;
            var channelBlob = mchw.clone().attr("data-channel", channelName).text(channelName);
            if (typeof modules.settings.settings.chat.channels.merger.mapping[channelName] !== "undefined") {
                var grouppedInto = modules.settings.settings.chat.channels.merger.mapping[channelName];
                var mcgGroupID = modules.settings.settings.chat.channels.merger.groups.indexOf(grouppedInto);
                mcgGroupID = modules.chatTabsConstants.Channels.Merged + "_MCGID_" + modules.chatTabsConstants.ChannelNameMap[grouppedInto];
                if (modules.settings.settings.chat.channels.merger.defaultChannels[grouppedInto] === channelName) {
                    channelBlob.insertAfter("#"+mcgGroupID+" > input");
                } else {
                    channelBlob.appendTo("#"+mcgGroupID);
                }
            } else {
                channelBlob.appendTo("#ToASChMMergedChannelsHolder");
            }
        }

        channelName = "";
        $(".incsort").sortable({
            items: "span",
            connectWith: ".incsort",
            receive: function(i,e) {
                channelName = $(e.item[0]).attr("data-channel");
                var groupName   = $(this).attr("data-group");
                if (typeof groupName === "undefined") {
                    delete modules.settings.settings.chat.channels.merger.mapping[channelName];
                } else {
                    modules.settings.settings.chat.channels.merger.mapping[channelName] = groupName;
                }
            },
            update: function(i,e){
                var groupName   = $(this).attr("data-group");
                if (typeof groupName !== "undefined") {
                    var channels = $(i.target).children("span");
                    var channelName = $(channels[0]).attr("data-channel");
                    modules.settings.settings.chat.channels.merger.defaultChannels[groupName] = channelName;
                } // else branch makes no sense :)
            }
        }).disableSelection();
    }

    function onSettingsCategoryClick() {
        var id = $(this).attr("id");
        if (id === "ToAScriptOptions") {
            $("#ToASettingsChannelMerger").slideUp(function(){
                $("#ToASettingsScriptSettings").slideDown();
            });
        } else {
            $("#ToASettingsScriptSettings").slideUp(function(){
                $("#ToASettingsChannelMerger").slideDown();
            });
        }
    }

    function onSettingsClose() {
        $("#ToASettingsWindow").hide();
        $("#modalBackground").fadeOut();
    }

    function onAddGroupExecute() {
        var groupName = $("#ToASChMNewgroupName").val();
        if (groupName.match(/^\s*$/)){
            groupName = modules.utils.randomName(7,13);
        }

        modules.settings.settings.chat.channels.merger.groups.push(groupName);
        modules.chatTabsConstants.ChannelNameMap[groupName] = modules.utils.randomName(3,5) + "_" + modules.utils.randomInt(5,9);
        $("#ToASettings").click();
    }

    function onAddGroup() {
        $.confirm({
            "title" : "New Group Name",
            "message" : "<input type=\"text\" id=\"ToASChMNewgroupName\" style=\"width:100%;\">",
            "buttons" : {
                "Create" : {
                    "class" : "green",
                    "action" : onAddGroupExecute
                },
                "Cancel" : {
                    "class" : "red",
                    "action" : function() {
                    }
                }
            }
        });
        $("#ToASChMNewgroupName").focus();
    }

    function onRemoveGroupExecute(element) {
        var groupID = element.attr("data-gnid");

        var groupName = modules.settings.settings.chat.channels.merger.groups[groupID];

        for (var x in modules.settings.settings.chat.channels.merger.mapping) {
            if (modules.settings.settings.chat.channels.merger.mapping[x] === groupName) {
                delete modules.settings.settings.chat.channels.merger.mapping[x];
            }
        }

        modules.settings.settings.chat.channels.merger.groups.splice(groupID, 1);

        var groupChannelID = modules.chatTabsCore.Channels.Merged + "_MCGID_" + modules.chatTabsConstants.ChannelNameMap[groupName];
        $("#channelTab"+groupChannelID).remove();
        modules.chatTabsCore.deleteChannel(groupChannelID);
        delete modules.chatTabsConstants.ChannelNameMap[groupName];
        delete modules.settings.settings.chat.channels.merger.defaultChannels[groupName];
        $("#chatMessageList li").attr("class", "");
        $("#channelTabList > div:nth-child(2)").click();
        $("#ToASettings").click();
    }

    function onRemoveGroup() {
        $.confirm({
            "title" : "Group Delete Confirmation",
            "message" : "Are you sure you want to remove this channel group?",
            "buttons" : {
                "Yes" : {
                    "class" : "green",
                    "action" : function() { onRemoveGroupExecute($(this)); }
                },
                "No" : {
                    "class" : "red",
                    "action" : function() {
                    }
                }
            }
        });
    }

    function restoreSettings() {
        var options = $('#ToASettingsScriptSettings').find(".settingsChanger");

        options.each(function (i, e) {
            var setting = $(e).attr("data-setting");

            $(e).prop("checked", modules.settings.settings.chat[setting]);
        })
    }

    function onSettingsChanged(e) {
        var setting = $(e).attr("data-setting");
        modules.settings.settings.chat[setting] = $(e).prop("checked");
        var match = setting.match("^profile_tooltip_([a-z]+)");
        if (match !== null) {
            var POOption = modules.utils.capitalizeFirstLetter(match[1]);
            $(".ToAPO" + POOption).toggleClass("hidden");
        }
    }

    function registerHandlers() {
        $(document).on("click", "#ToASettings", onTabSettings);

        $(document).on("click", "#ToAScriptOptions, #ToAChannelMerger", onSettingsCategoryClick);

        $(document).on("click", "#ToASettingsWindowClose", onSettingsClose);

        $(document).on("click", "#ToASChMAddGroup", onAddGroup);

        $(document).on("click", ".ToASChMChGRemove", onRemoveGroup);

        $(document).on("change", ".settingsChanger", function(){ onSettingsChanged(this); });
    }

    function initialize() {
        createDomElements();
        registerHandlers();

        restoreSettings();
    }

    function ChatTabsUISettings() {
        RoAModule.call(this, "Chat Tabs UI Settings");

        this.addDependency("chatTabsCore");
        this.addDependency("chatTabsUI");
    }

    ChatTabsUISettings.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            initialize();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabsUISettings.prototype.constructor = ChatTabsUISettings;

    modules.chatTabsUISettings = new ChatTabsUISettings();

})(modules.jQuery);