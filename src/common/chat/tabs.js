/*(function ($) {
    'use strict';

    var groupsMap               = {};
    var channelLog              = {};
    var mainChannelID           = "2";
    var currentChannel          = "Main";

    var hovering;
    var hoveringOverTab;



    function resetUnreadCount() {
        var channelID                           = hoveringOverTab;
        channelLog[channelID].newMessages       = false;
        channelLog[channelID].newMessagesCount  = 0;
        updateChannelList(channelLog[channelID]);
        $("#channelPreviewWrapper").hide();
        $("#channelTabContextMenu").hide();
    }

    function purgeChannel(andRemove,confirmToo) {
        andRemove       = typeof andRemove==="undefined"?modules.settings.settings.chat.channel_remove:andRemove;
        confirmToo      = typeof confirmToo==="undefined"?false:confirmToo;
        var channelID   = hoveringOverTab;
        var channelName = channelLog[channelID].channelName;
        var confirmText = "Are you sure you want purge the \""+channelName+"\" channel"+(andRemove?" and remove it from tabs":"")+"?\nThis only affects your screen.";
        if (confirmToo || window.confirm(confirmText)){
            $(".chc_"+channelID).remove();
            resetUnreadCount();
            if (andRemove) {
                $("#channelTab"+channelID).remove();
                //delete channelLog[channelID];
                $("#channelTabMain").click();
                $("#channelPreviewWrapper").hide();
            }

        }
    }

    function isScriptChannel(channelID) {
        return scriptChannels.indexOf(channelID) !== -1;
    }

    $(document).on("click", "#CPAReset, #chTabCTMenuReset", function(){
        resetUnreadCount();
    });

    $(document).on("click", "#CPAReset, #chTabCTMenuLast", function(){
        var channelName = channelLog[hoveringOverTab].channelName;
        var msg = "/last "+channelName;
        if (channelName === "CLAN") {
            msg = "/c /last";
        } else if (modules.settings.settings.chat.channels.merger.groups.indexOf(channelName) !== -1) {
            if (typeof modules.settings.settings.chat.channels.merger.defaultChannels[channelName] !== "undefined") {
                msg = "/last " + modules.settings.settings.chat.channels.merger.defaultChannels[channelName];
            }
        } else if (channelName === "Whispers Log") {
            msg = "/w /last";
        } else if (scriptChannels.indexOf(hoveringOverTab) !== -1) {
            return false;
        }
        $("#chatMessage").text(msg);
        $("#chatSendMessage").click();
    });

    $(document).on("click", "#CPAPurge, #chTabCTMenuPurge", function(){
        var confirmToo = $(this).attr("id") === "chTabCTMenuPurge";
        purgeChannel(false, confirmToo);
    });

    $(document).on("click", "#CPARemove, #chTabCTMenuRemove", function(){
        var confirmToo = $(this).attr("id") === "chTabCTMenuRemove";
        purgeChannel(true, confirmToo);
    });

    $(document).on("click", "#chTabCTMenuLeave", function(){
        var channelName = channelLog[hoveringOverTab].channelName;
        purgeChannel(true, true);
        $("#chatMessage").text("/leave " + channelName);
        $("#chatSendMessage").click();
    });

    $(document).on("click", "#chTabCTMenuColor", function(){
        if (hoveringOverTab.indexOf(MergedChannelsGroup) !== -1) {
            var color = modules.utils.randomColor();
            channelLog[hoveringOverTab].channelColor = color;
            updateChannelList(channelLog[hoveringOverTab]);
        } else {
            $.alert("Tab color change failed! Please try again!", "Group tab color change");
        }
    });



    $(document).on("click", ".ChMMChX", function(){
        var channel             = $(this).attr("data-channel");
        var channelID           = resolveChannelID(channel).cID;
        channelLog[channelID].muted  = false;
        updateChannelList(channelLog[channelID]);
        var pos = modules.settings.settings.chat.channels.mutedChannels.indexOf(channel);
        if (pos !== -1) {
            modules.settings.settings.chat.channels.mutedChannels.splice(pos,1);
        }
        $(this).parent().fadeOut("slow", function(){
            $(this).remove();
        });
    });

    $(document).on("keydown", function(e){
        var keys = {
            Q: 81, // [Q]uickscope
            C: 67, // Ni[c]kname
            E: 69 // @m[e]ntion
        };
        var key = e.which;
        if ($("#profileOptionTooltip").css("display")==="block") {

            if (key === keys.Q) {
                quickScopeUser();
            } else if (key === keys.E) {
                mentionUser();
                e.preventDefault();
            } else if (key === keys.C) {
                nicknameUser();
            }
        }
    });



    function ChatTabs() {
        RoAModule.call(this, "Chat Tabs");
    }

    ChatTabs.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabs.prototype.constructor = ChatTabs;

    modules.chatTabs = new ChatTabs();

})(modules.jQuery);
*/