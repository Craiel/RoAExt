(function ($) {
    'use strict';

    const AutoClickActiveTabInterval = 2000;

    var autoClickChannelTabInterval;

    function autoClickActiveTab() {
        $("#channelTabList > div:nth-child(2)").click();
        autoClickChannelTabInterval.clear();
    }

    function createDomElements() {
        // Channel tab list
        $(modules.templates.chatTabChannelTabList).insertBefore("#chatMessageListWrapper");

        // Preview channel
        $(modules.templates.chatTabChannelPreview).appendTo("body");
        $("#channelPreviewContent").mCustomScrollbar({scrollInertia: 250,mouseWheel:{scrollAmount: 40}});

        $("#channelTabListWrapper").mCustomScrollbar({axis: "x", advanced: { autoExpandHorizontalScroll:true }});
        $("#channelTabList").sortable({items: ".channelTab", distance: 5});
        $("#channelTabList").disableSelection();
    }

    function onChannelTabClick() {
        $(".channelTab").removeClass("chTabSelected");
        var channelId = $(this).attr("data-channel");

        modules.chatTabsCore.selectChannelTab(channelId);

        // $(".processed").hide();
        $("#chatMessageList > li:not(.hidden)").addClass("hidden");
        $(".chc_" + channelId).removeClass("hidden");
        $("#channelTab" + channelId).addClass("chTabSelected");
        $("#channelPreviewWrapper").hide();

        if (modules.chatTabsCore.chatDirection === modules.chatTabsConstants.ChatDirectionDown) {
            setTimeout(function(){
                $("#chatMessageListWrapper").mCustomScrollbar("scrollTo",  "bottom");
            }, 500);
        }
    }

    function onChannelTabHover() {
        clearTimeout(modules.chatTabsUI.hovering);
        var channelId = $(this).attr("data-channel");
        modules.chatTabsUI.hoveringOverTab = channelId;
        if (!modules.settings.settings.chat.preview){
            return;
        }

        var channelName = modules.chatTabsCore.getChannelName(channelId);

        var channelPreviewWrapper = $("#channelPreviewWrapper");

        var cssOptions = {
            top: ($(this).offset().top + 25)+"px"
        };

        var previewContent = "There are no new messages in this channel!";
        if (modules.chatTabsCore.hasNewMessages(channelId)) {
            var previewMessages = [];
            $(".chc_"+channelId).each(function(i,e){
                if (i < modules.chatTabsCore.getNewMessageCount(channelId)) {
                    previewMessages.push($(e).html());
                }
            });

            previewContent = previewMessages.join("<br>");
        }

        $("#channelPreviewMessages").html(previewContent);

        if ($(this).offset().left > $(document).width() / 2){
            cssOptions.left = ($(this).offset().left - channelPreviewWrapper.width() + 50)+"px";
        } else {
            cssOptions.left = ($(this).offset().left + 50)+"px";
        }

        channelPreviewWrapper
            .css(cssOptions)
            .children("h5")
            .text("'" + channelName + "' preview");

        if (modules.settings.settings.chat.preview_reset){
            $("#CPAReset").show();
        } else {
            $("#CPAReset").hide();
        }

        if (modules.settings.settings.chat.purge){
            $("#CPAPurge").show();
        } else {
            $("#CPAPurge").hide();
        }

        if (modules.settings.settings.chat.channel_remove){
            $("#CPARemove").show();
        } else {
            $("#CPARemove").hide();
        }
    }

    function onMouseOver(e) {
        clearTimeout(modules.chatTabsUI.hovering);
        if (typeof modules.chatTabsUI.hoveringOverTab !== "undefined" && typeof modules.chatTabsCore.channelExists(modules.chatTabsUI.hoveringOverTab)) {

            var channelTab = $("#channelTab" + modules.chatTabsUI.hoveringOverTab);
            var channelPreviewWrapper = $("#channelPreviewWrapper");
            var shouldShow = modules.chatTabsCore.hasNewMessages(modules.chatTabsUI.hoveringOverTab);
            var OpenAndKeep = $(e.target).closest(channelTab).length || $(e.target).closest(channelPreviewWrapper).length;
            var delay = OpenAndKeep ? 500 : 250;
            modules.chatTabsUI.hovering = setTimeout(function(){
                if (modules.settings.settings.chat.preview && OpenAndKeep && shouldShow) {
                    channelPreviewWrapper.show(0, function(){
                        if (modules.chatTabsCore.chatDirection === modules.chatTabsConstants.ChatDirectionDown) {
                            $("#channelPreviewContent").mCustomScrollbar("scrollTo",  "bottom");
                        }
                    });
                } else {
                    channelPreviewWrapper.hide();
                }
            }, delay);
        }
    }

    function onJoinChannel() {
        var chn = $(this).text().replace(/^,+|,+$/gm,"");
        $("#chatMessage").text("/join "+ chn);

        var pwd = $(this).parent().find(".jcPWD").text();
        $("#chatMessage").append(" " + pwd);

        if (modules.settings.settings.chat.auto_join) {
            $("#chatSendMessage").click();
        }
    }

    function registerHandlers() {
        $(document).on("click", ".channelTab", onChannelTabClick);

        $(document).on("mouseover", ".channelTab", onChannelTabHover);
        $(document).on("mouseover", onMouseOver);

        $(document).on("click", ".joinChannel", onJoinChannel);
    }

    function initialize() {
        createDomElements();
        registerHandlers();
    }

    function ChatTabsUI() {
        RoAModule.call(this, "Chat Tabs UI");

        this.addDependency("chatTabsCore");
    }

    ChatTabsUI.prototype = Object.spawn(RoAModule.prototype, {
        hovering: null,
        hoveringOverTab: null,
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            initialize();

            autoClickChannelTabInterval = modules.createInterval("ChatTabUIAutoClick");
            autoClickChannelTabInterval.set(autoClickActiveTab, AutoClickActiveTabInterval);

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabsUI.prototype.constructor = ChatTabsUI;

    modules.chatTabsUI = new ChatTabsUI();

})(modules.jQuery);