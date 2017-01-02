(function ($) {

    function createDomElements() {
        // context menu
        $(modules.templates.chatTabContextMenu).appendTo("body");
        $("#channelTabContextMenu").hide();
    }

    function onChannelTabContextMenu(e) {
        e.preventDefault();
        var cssOptions = {
            top: e.pageY+"px"
        };

        if ($(this).offset().left > $(document).width() / 2){
            cssOptions.left = (e.pageX - $(this).width())+"px";
        } else {
            cssOptions.left = e.pageX+"px";
        }

        if (modules.settings.settings.chat.preview_reset){
            $("#chTabCTMenuReset").show();
        } else {
            $("#chTabCTMenuReset").hide();
        }

        if (modules.settings.settings.chat.purge){
            $("#chTabCTMenuPurge").show();
        } else {
            $("#chTabCTMenuPurge").hide();
        }

        if (modules.settings.settings.chat.channel_remove){
            $("#chTabCTMenuRemove").show();
        } else {
            $("#chTabCTMenuRemove").hide();
        }

        if (modules.settings.settings.chat.channels.mutedChannels.indexOf(modules.chatTabsCore.getChannelName(modules.chatTabsUI.hoveringOverTab) !== -1)) {
            $("#chTabCTMenuUnMute").show();
            $("#chTabCTMenuMute").hide();
        } else {
            $("#chTabCTMenuMute").show();
            $("#chTabCTMenuUnMute").hide();
        }

        if (modules.chatTabsUI.hoveringOverTab.match(/^[a-z]+/i)) {
            $("#chTabCTMenuLeave").hide();
            if (modules.chatTabsUI.hoveringOverTab.indexOf(modules.chatTabsConstants.Channels.Merged) !== -1) {
                $("#chTabCTMenuColor").show();
            } else {
                $("#chTabCTMenuColor").hide();
            }
        } else {
            $("#chTabCTMenuColor").hide();
            $("#chTabCTMenuLeave").show();
        }

        if (modules.chatTabsConstants.ScriptChannels.indexOf(modules.chatTabsUI.hoveringOverTab) !== -1 && modules.chatTabsUI.hoveringOverTab !== modules.chatTabsConstants.Channels.Whispers) {
            $("#chTabCTMenuLast").hide();
        } else {
            $("#chTabCTMenuLast").show();
        }

        $("#channelTabContextMenu").css(cssOptions).show();
        $("#channelPreviewWrapper").hide();
        return false;
    }

    function onMute() {
        if (typeof hoveringOverTab === "undefined"){
            return;
        }
        var channel = channelLog[hoveringOverTab].channelName;
        var pos = modules.settings.settings.chat.channels.mutedChannels.indexOf(channel);
        if (pos !== -1) {
            modules.settings.settings.chat.channels.mutedChannels.splice(pos,1);
        }
        channelLog[hoveringOverTab].muted = false;
        updateChannelList(channelLog[hoveringOverTab]);
    }

    function onUnmute() {
        if (typeof hoveringOverTab === "undefined"){
            return;
        }
        var channel = channelLog[hoveringOverTab].channelName;
        if (modules.settings.settings.chat.channels.mutedChannels.indexOf(channel) === -1) {
            modules.settings.settings.chat.channels.mutedChannels.push(channel);
        }
        channelLog[hoveringOverTab].muted = true;
        updateChannelList(channelLog[hoveringOverTab]);
    }

    function registerHandlers() {
        $(document).on("contextmenu", ".channelTab", onChannelTabContextMenu);

        $(document).on("click", function(){ $("#channelTabContextMenu").hide(); });

        $(document).on("click", "#chTabCTMenuMute", onMute);
        $(document).on("click", "#chTabCTMenuUnMute", onUnmute);
    }

    function initialize() {
        createDomElements();
        registerHandlers();
    }

    function ChatTabsUIContext() {
        RoAModule.call(this, "Chat Tabs UI Context");

        this.addDependency("chatTabsCore");
        this.addDependency("chatTabsUI");
    }

    ChatTabsUIContext.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            initialize();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabsUIContext.prototype.constructor = ChatTabsUIContext;

    modules.chatTabsUIContext = new ChatTabsUIContext();

})(modules.jQuery);