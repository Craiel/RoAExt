(function ($) {

    function quickScopeUser(){
        if (!modules.settings.settings.chat.profile_tooltip_quickscope) {
            return false;
        }

        $("#chatMessage").text("/whois "+$("#profileOptionTooltip").attr("data-username"));
        $("#chatSendMessage").click();
        $("#profileOptionTooltip").hide();

        setTimeout(function(){ $("#channelTab" + modules.chatTabsConstants.Channels.CmdResponse).click(); }, 1000);
    }

    function mentionUser() {
        if (!modules.settings.settings.chat.profile_tooltip_mention) {
            return false;
        }

        $("#chatMessage").append(" @"+$("#profileOptionTooltip").attr("data-username")).focus();
        $("#profileOptionTooltip").hide();
    }

    function nicknameUser() {
        if (!modules.settings.settings.chat.profile_tooltip_nickname) {
            return false;
        }

        var username = $("#profileOptionTooltip").attr("data-username");
        $.confirm({
            "title" : "Nickname for "+username,
            "message" : "<input type=\"text\" id=\"ToASPONicknameName\" style=\"width:100%;\" placeholder=\"Leave blank to unnickname\">",
            "buttons" : {
                "Nickname" : {
                    "class" : "green",
                    "action" : function() {
                        var newNick = $("#ToASPONicknameName").val();
                        if (newNick.match(/^\s*$/)) {
                            $("#chatMessage").text("/unnickname "+username);
                        } else {
                            $("#chatMessage").text("/nickname "+username+" "+newNick);
                        }
                        $("#chatSendMessage").click();
                    }
                },
                "Cancel"       : {
                    "class"     : "red",
                    "action"    : function() {
                    }
                }
            }
        });

        setTimeout(function() {
            $("#ToASPONicknameName").val("").focus();
        }, 500);
    }

    function createDomElements() {
        // profile tooltip extras
        $("<span class='ToAPONickname'> · </span>").appendTo("#profileOptionTooltip");
        $("<a id='profileOptionNick' class='ToAPONickname'>Ni[c]kname</a>").appendTo("#profileOptionTooltip");

        $("<span class='ToAPOMention'> · </span>").appendTo("#profileOptionTooltip");
        $("<a id='profileOptionAt' class='ToAPOMention'>@m[e]ntion</a>").appendTo("#profileOptionTooltip");

        $("<span class='ToAPOQuickscope'> · </span>").appendTo("#profileOptionTooltip");
        $("<a id='profileOptionQuickScope' class='ToAPOQuickscope'>[Q]uickscope</a>").appendTo("#profileOptionTooltip");

        // init
        $(".ToATooltip").tooltip();
    }

    function registerHandlers() {
        $(document).on("click", "#profileOptionQuickScope", quickScopeUser);
        $(document).on("click", "#profileOptionAt", mentionUser);
        $(document).on("click", "#profileOptionNick", nicknameUser);
    }

    function initialize() {
        createDomElements();
        registerHandlers();
    }

    function ChatTabsUITooltip() {
        RoAModule.call(this, "Chat Tabs UI Tooltip");

        this.addDependency("chatTabsCore");
        this.addDependency("chatTabsUI");
    }

    ChatTabsUITooltip.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {

            // Check dependencies before continuing to load
            if(!this.checkDependencies()) {
                return;
            }

            initialize();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatTabsUITooltip.prototype.constructor = ChatTabsUITooltip;

    modules.chatTabsUITooltip = new ChatTabsUITooltip();

})(modules.jQuery);