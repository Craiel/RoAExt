(function ($) {
    'use strict';

    var processInterval;

    var groupMap = {};
    var channelLog = {};
    var currentChannel = "Main";

    function updateChannelList(channel) {
        var tab = $("#channelTab" + channel.channelId);
        if (tab.length === 0) {
            if (channel.muted) {
                return;
            }
            $("<div>")
                .attr("id", "channelTab" + channel.channelId)
                .attr("data-channel", channel.channelId)
                .addClass("border2 ui-element channelTab")
                .css({
                    color: channel.channelColor
                })
                .appendTo("#channelTabList");
            tab = $("#channelTab" + channel.channelId);
        }

        var channelTabLabel = "#"+channel.channelName;
        tab.text(channelTabLabel).css({color: channel.channelColor});

        if (channel.newMessages && !channel.muted) {

            if ($(".Ch"+channel.channelId+"Badge").length === 0) {
                $("<span>")
                    .addClass("ChBadge")
                    .addClass("border2")
                    .addClass("Ch"+channel.channelId+"Badge")
                    .text(channel.newMessagesCount)
                    .appendTo("#channelTab"+channel.channelId);
            } else {
                $(".Ch"+channel.channelID+"Badge").text(channel.newMessagesCount);
            }
        }

        if (channel.muted) {
            $("<span>")
                .addClass("ChBadge fa fa-times border2 ui-element")
                .appendTo("#channelTab" + channel.channelId);
        }
    }

    function createChannelEntry(newChannel, newChannelId, newChannelColor) {
        channelLog[newChannelId] = {
            channelName: newChannel,
            channelId: newChannelId,
            channelColor: newChannelColor,
            messages: 0,
            newMessages: false,
            newMessagesCount: 0,
            muted: modules.settings.settings.chat.channels.mutedChannels.indexOf(newChannel) !== -1
        };
    }

    function processMessageAttributes(context) {
        // lets get rid of staff stuff
        context.plainText = context.plainText.replace(/^\[X\]\s*/, "");

        // now clean up spaces
        context.plainText = context.plainText.replace(/\s+/g, " ");

        // default message format [11:11:11] [Channel] (optional) the rest of the message
        context.defaultMsg = context.plainText.match(/^\[([^\]]+)\]\s*(\[([^\]]+)\])?\s*(.*)/);

        // clan MoTD: [11 Nov, 1111] Clan Message of the Day:
        context.isClanMoTD = context.plainText.replace(/^\[[0-9]+\s+[a-zA-Z]+\,\s*[0-9]+\]\s*/, "").indexOf("Clan Message of the Day:") === 0;

        // Staff Server Messages [11:11:11] [ Whatever the hell. ]
        context.isServerMsg = context.plainText.match(/^\[[^\]]+\]\s*\[\s+.*\s+]$/);

        // whisper detection
        context.isWhisper = context.plainText.match(/^\[[^\]]+\]\s*Whisper\s*(to|from)\s*([^:]+)/);
        context.isWhisper = context.isWhisper && $(this).closest("li").find("span:eq(2)").text().indexOf("Whisper") === 0;

        // wire detection
        context.isWire = context.plainText.match(/^\[[^\]]+\]\s*(You|[a-zA-Z]+)\s*wired\s*.*\s*(you|[a-zA-Z]+)\.$/);
        // [11:11:11] Username sent a whatever to you.

        context.isChatNotif = context.element.children(".chat_notification").length > 0 || context.element.hasClass("chat_notification");
        context.isChatReconnect = context.element.attr("id") === "websocket_reconnect_line";
    }

    function processMessageChannelAndInfo(context) {
        context.channel = "";
        if (currentChannel.match(/^[0-9]+$/)) {
            context.channel = channelLog[currentChannel].channelName;
        } else if (currentChannel.indexOf(modules.chatTabsConstants.Channels.Merged) === 0) {
            context.channel = channelLog[currentChannel].channelName;
        } else if (modules.chatTabsConstants.ScriptChannels.indexOf(currentChannel) !== -1) {
            context.channel = channelLog[currentChannel].channelName;
        } else {
            context.channel = currentChannel;
        }

        context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);

        if (context.defaultMsg !== null) {
            context.channel = typeof context.defaultMsg[3] === "undefined" ? "Main" : context.defaultMsg[3];
            context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);
        }

        if (context.isClanMoTD) {
            context.channel = "CLAN";
            context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);
        } else if (context.isServerMsg){
            context.channel = "Server Messages";
            context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);
        } else if (context.isWhisper){
            context.channel = "Whispers Log";
            context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);
        } else if (context.isWire && modules.settings.settings.chat.group_wires){
            context.channel  = "Wires Log";
            context.channelInfo = modules.chatTabsCore.getChannelId(context.channel);
        }
    }

    function processMessageChannelIdAndColor(context) {
        context.channelId = context.channelInfo.id;
        context.channel = context.channelInfo.on;
        if (
            context.channelId !== modules.chatTabsConstants.Channels.CmdResponse &&
            context.channelId !== modules.chatTabsConstants.Channels.ServerMessages &&
            context.channelId !== modules.chatTabsConstants.Channels.Wires &&
            ( context.isChatNotif || context.isChatReconnect)
        ) {
            context.channelId = context.channelInfo.id;
        }

        if (context.channelId === modules.chatTabsConstants.Channels.CmdResponse){
            context.channel = "Info Channel";
        }

        context.channelColor    = modules.chatTabsCore.getChannelColor(context.channelId, context.channelInfo.name);

        if (typeof modules.settings.settings.chat.channels.merger.mapping[context.channel] !== "undefined") {
            var groupName   = modules.settings.settings.chat.channels.merger.mapping[context.channel];
            context.channelId = modules.chatTabsConstants.Channels.Merged + "_MCGID_" + groupMap[groupName];
            context.channel = groupName;
            context.channelColor = modules.utils.randomColor();
        }
    }

    function processMessageChannelLog(context) {
        if (typeof channelLog[context.channelId] === "undefined") {
            createChannelEntry(context.channel, context.channelId, context.channelColor);
        }

        if (context.channelId != currentChannel){
            channelLog[context.channelId].newMessages = true;
            channelLog[context.channelId].newMessagesCount++;
        }

        channelLog[context.channelId].messages++;
    }

    function processMessageDom(context) {
        // console.log("cl",currentChannel, "id", channelId);
        if (currentChannel != context.channelId){
            context.element.addClass("hidden");
        }

        context.element.addClass("processed");
        context.element.addClass("chc_" + context.channelId);

        if (modules.settings.settings.chat.channels.mutedChannels.indexOf(context.channel) !== -1){
            context.element.remove();
        }

        if (modules.settings.settings.chat.at_username) {
            context.element.html(context.element.html().replace(/\@([a-zA-Z]+)/g,"@<a class=\"profileLink\">$1</a>"));
        }

        if (modules.settings.settings.chat.join_channel_link) {
            context.element.html(context.element.html().replace(/\/join\s+([^\s]+)\s*([^\s<]+)?/, "/join <a class=\"joinChannel\">$1</a> <span class=\"jcPWD\">$2</span>"));
        }
    }

    function processMessage(i, e) {
        var context = {
            element: $(e),
            plainText: $(e).text()
        };

        processMessageAttributes(context);
        processMessageChannelAndInfo(context);
        processMessageChannelIdAndColor(context);
        processMessageChannelLog(context);
        processMessageDom(context);

        updateChannelList(channelLog[context.channelId]);
    }

    function processMessages() {
        if ($("#chatChannel option").length > 2) {
            $("#chatMessageList li:not(.processed)").each(processMessage);
        }
    }

    function onAjaxSuccess(requestData) {
        var direction = "";
        if (requestData.json.hasOwnProperty("cs")) {
            if (modules.chatTabsConstants.ChatDirections.indexOf(requestData.json.cs) !== -1) {
                direction = requestData.json.cs;
            }
        } else if (requestData.json.hasOwnProperty("p") && requestData.json.p.hasOwnProperty("chatScroll")) {
            if (modules.chatTabsConstants.ChatDirections.indexOf(requestData.json.p.chatScroll) !== -1) {
                direction = requestData.json.p.chatScroll;
            }
        }

        if (direction !== "") {
            modules.chatTabsCore.chatDirection = direction;
        }
    }

    function ChatTabsCore() {
        RoAModule.call(this, "Chat Tabs Core");
    }

    ChatTabsCore.prototype = Object.spawn(RoAModule.prototype, {
        chatDirection: "up",
        lastTimeMessageReceived: null,
        load: function () {

            this.lastTimeMessageReceived = Date.now();

            modules.ajaxHooks.registerAll(onAjaxSuccess);

            processInterval = modules.createInterval("ChatTabProcess");
            processInterval.set(processMessages, modules.chatTabsConstants.ProcessInterval);

            RoAModule.prototype.load.apply(this);
        },
        createCustomId: function (channelId, resolved, name, on) {
            return {
                id: channelId,
                res: resolved,
                name: name,
                on: typeof on !== "undefined" ? on : name
            };
        },
        getChannelId: function (channel) {
            var channelId;
            var origChannelName = channel;
            var resolved = true;

            switch (channel) {
                case "CLAN":
                case "AREA":
                case "HELP":
                case "STAFF":
                case "TRADE":
                case "GLOBAL": {
                    channel = modules.utils.capitalizeFirstLetter(channel.toLowerCase());
                    break;
                }

                default: {
                    if (channel.substr(0,4) === "AREA") {
                        channel = "Area";
                    } else if (channel === "Market") {
                        return this.createCustomId(modules.chatTabsConstants.Channels.CmdResponse, true, "");//  info channel changes this later
                    } else if (channel === "Whispers Log") {
                        return this.createCustomId(modules.chatTabsConstants.Channels.Whispers, true, channel, origChannelName);
                    } else if (channel === "Wires Log") {
                        return this.createCustomId(modules.chatTabsConstants.Channels.Wires, true, channel, origChannelName);
                    } else if (channel === "Server Messages") {
                        return this.createCustomId(modules.chatTabsConstants.Channels.ServerMessages, true, channel, origChannelName);
                    } else if (channel.match(/^Level:\s+[0-9]+/)) {
                        return this.createCustomId(modules.chatTabsConstants.Channels.CmdResponse, true, "", origChannelName);//  info channel changes this later
                    }
                }
            }

            if (typeof modules.chatTabsConstants.ChannelNameMap[origChannelName] !== "undefined") {
                origChannelName = modules.chatTabsConstants.ChannelNameMap[origChannelName];
            }

            channelId = 0;
            $("select#chatChannel option").each(function(i,e){
                var n = $(e).attr("name");
                if (n === "channel" + channel) {
                    channelId = $(e).attr("value");
                }
            });

            if (modules.settings.settings.chat.channels.merger.groups.indexOf(origChannelName) !== -1) {
                channelId = modules.chatTabsConstants.Channels.Merged + "_MCGID_" + groupMap[origChannelName];
            }

            if (origChannelName == "GLOBAL"){
                channelId = modules.chatTabsConstants.GlobalChannel;
            }
            if (origChannelName == "Event"){
                channelId = modules.chatTabsConstants.EventChannel;
            }

            if (channelId === 0) {
                resolved = false;
                channelId = "2"; // Main
            }

            return this.createCustomId(channelId, resolved, channel, origChannelName);
        },
        getChannelColor: function (channelId, channelName) {
            var color = "";

            switch (channelId) {
                case modules.chatTabsConstants.Channels.ServerMessages: {
                    color = "#007f23";
                    break;
                }

                case modules.chatTabsConstants.Channels.CmdResponse: {
                    color = "#317D80";
                    break;
                }

                case modules.chatTabsConstants.Channels.Whispers: {
                    color = "#DE3937";
                    break;
                }

                case modules.chatTabsConstants.Channels.Wires: {
                    color = "#39DE37";
                    break;
                }

                default: {
                    try {
                        color = $(".chatChannel[data-id=\"" + channelName + "\"]").css("background-color");
                    } catch (e) {
                        color = "";
                    }

                    if (color === "" || typeof color === "undefined") {
                        $(".chatChannel").each(function(i, e){
                            if ($(e).attr("data-id") === channelName) {
                                color = $(e).css("background-color");
                            }
                        });
                    }
                }
            }

            return color;
        },
        getChannelInfo: function (channel) {
            return channelLog[channel];
        },
        getActiveChannels: function() {
            return Object.keys(channelLog)
        },
        selectChannelTab: function (channelId) {
            channelLog[channelId].newMessages = false;
            channelLog[channelId].newMessagesCount = 0;
            updateChannelList(channelLog[channelId]);

            currentChannel = channelId;

            if (channelId.match(/^[0-9]+$/) === null) {
                var groupName = channelLog[channelId].channelName;
                if (modules.settings.settings.chat.channels.merger.groups.indexOf(groupName) !== -1) {
                    if (typeof modules.settings.settings.chat.channels.merger.defaultChannels[groupName] !== "undefined") {
                        channelId = this.getChannelId(modules.settings.settings.chat.channels.merger.defaultChannels[groupName]).id;
                    }
                }
            }

            var channelOption = $("#chatChannel option[value="+channelId+"]");
            if (channelOption.length > 0){
                $("#chatChannel").val(channelId);
            }
        },
        forceLoadChannel: function (channel) {
            var channelInfo = modules.chatTabsCore.getChannelId(channel);
            var channelId = channelInfo.id;
            var channelColor = modules.chatTabsCore.getChannelColor(channelId, channelInfo.name);
            if (typeof channelLog[channelId] === "undefined") {
                createChannelEntry(channelInfo.on, channelId, channelColor);
            }
        },
        forceLoadChannelExplicit: function (on, name, color) {
            if (typeof channelLog[name] === "undefined") {
                createChannelEntry(on, name, color);
            }
        },
        channelExists: function (channel) {
            return channelLog[channel] !== "undefined";
        },
        getChannelName: function (channel) {
            return channelLog[channel].channelName;
        },
        hasNewMessages: function (channel) {
            if (typeof channelLog[channel] === "undefined") {
                return false;
            }

            return channelLog[channel].newMessages === true;
        },
        getNewMessageCount: function (channel) {
            if (typeof channelLog[channel] === "undefined") {
                return 0;
            }

            return channelLog[channel].newMessagesCount;
        },
        deleteChannel: function (channel) {
            delete channelLog[channel];
        }
    });

    ChatTabsCore.prototype.constructor = ChatTabsCore;

    modules.chatTabsCore = new ChatTabsCore();

})(modules.jQuery);