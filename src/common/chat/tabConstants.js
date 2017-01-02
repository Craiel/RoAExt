(function () {
    'use strict';

    var module = {
        ProcessInterval: 500,
        GlobalChannel: 1000000000,
        EventChannel: 2000000000,
        ChatDirectionUp: "up",
        ChatDirectionDown: "down",
        ChatDirections: [],
        Channels: {
            ServerMessages: "SML_325725_2338723_CHC",
            CmdResponse: "CMDRC_4000_8045237_CHC",
            Whispers: "UW_7593725_3480021_CHC",
            Merged: "MCG_105704_4581101_CHC",
            Wires: "WC_0952340_3245901_CHC"
        },
        ChannelNameMap: {
            "Global": "GLOBAL",
            "Clan": "CLAN",
            "Area": "AREA",
            "Help": "HELP",
            "Staff": "STAFF",
            "Trade": "TRADE"
        }
    };

    module.ChatDirections = [module.ChatDirectionUp, module.ChatDirectionDown];
    module.ScriptChannels = [module.Channels.ServerMessages, module.Channels.CmdResponse, module.Channels.Whispers, module.Channels.Wires];

    modules.chatTabsConstants = module;

})();