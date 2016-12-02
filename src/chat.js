var AVBUChat = (function($) {
    'use strict';

    var module = {};

    var peopleMod = {};

    if(localStorage.peopleMod)
        peopleMod = JSON.parse(localStorage.peopleMod);

    function addChatColorPicker() {
        $('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css"><style>.sp-replacer{border: 1px solid #01b0aa; background: #01736D;}</style>');
        $('#profileOptionProfile').after(' . <input type="text" id="profileOptionColor" />');

        // Initialize color picker
        $("#profileOptionColor").spectrum({
            showInput: true,
            showInitial: true,
            allowEmpty: true,
            clickoutFiresChange: false,
            change: function(color) {
                if(color == null && ($('#profileOptionUsername').text() in peopleMod)) {
                    peopleMod[$('#profileOptionUsername').text()] = 'white';
                    modChatColors();
                    delete peopleMod[$('#profileOptionUsername').text()];
                    savePeopleMod();
                }
                else {
                    peopleMod[$('#profileOptionUsername').text()] = color.toHexString();
                    modChatColors();
                    savePeopleMod();
                }
            }
        });

        // Add observer to chat to change colors on new comments.
        var observer = new MutationObserver(function( mutations ) {
            mutations.forEach(function( mutation ) {
                if( mutation.addedNodes !== null )
                    modChatColors();
                if($('#profileOptionUsername').text() in peopleMod)
                    $("#profileOptionColor").spectrum("set", peopleMod[$('#profileOptionUsername').text()]);
                else {
                    $("#profileOptionColor").spectrum("set", '');
                    //$('#profileOptionTooltip .sp-preview-inner').css('background-color', 'transparent');
                    //$('#profileOptionTooltip .sp-preview-inner').addClass('sp-clear-display');
                }
            });
        });
        observer.observe($('#chatMessageList')[0], { childList: true, characterData: true});
        observer.observe($('#profileOptionTooltip')[0], { attributes: true, characterData: true});
    }

    function addChatSwap() {
        if(typeof Storage == "undefined")
            alert('Local Storage is not supported on this browser. Chat Swap preference will not be saved next session');
        var arrow = "?";
        if(localStorage.chatmove == "true") {
            var e1 = $('#contentWrapper'), e2 = $('#chatWrapper');
            e1.insertAfter(e2);
            e2.insertAfter('#navWrapper');
            $('#effectInfo').insertBefore('#activityWrapper');
            $('#houseNotificationWrapper').insertBefore('#activityWrapper');
            arrow = "?";
            $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top -2);
        }
        $('<div style="position: absolute;font-size: 14px;color: #01B0AA;left: 12px;cursor: pointer;padding: 1px;" font-size:="">' + arrow + '</div>').prependTo('#areaWrapper>h5').click(function(){
            localStorage.chatmove = !(localStorage.chatmove == "true");
            var e1 = $('#chatWrapper'), e2 = $('#contentWrapper');
            if(localStorage.chatmove == "true") {
                e1 = $('#contentWrapper'), e2 = $('#chatWrapper');
                $('#effectInfo').insertBefore('#activityWrapper');
                $('#houseNotificationWrapper').insertBefore('#activityWrapper');
                $(this).html('?');
            }
            else {
                $('#effectInfo').appendTo('#rightWrapper');
                $('#houseNotificationWrapper').appendTo('#rightWrapper');
                $(this).html('?');
            }
            e1.insertAfter(e2);
            e2.insertAfter('#navWrapper');
            $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top -2);
        });
    }

    function modChatColors() {
        $('#chatMessageList').find('.profileLink').each(function() {
            if($(this).text() in peopleMod) {
                var text = $(this).next();
                // Check if this is main channel by the text of the 3rd span. Whispers are special cases, other non-main channels start a [channelName] output.
                var e = $(this).closest('li').find('span:eq(2)').text();
                if(e.indexOf('Whisper') == -1 && e != '[')
                    text.css('color', peopleMod[$(this).text()]);
            }
        });
    }

    function savePeopleMod() {
        localStorage.peopleMod = JSON.stringify(peopleMod);
    }

    function initialize() {
        $('head').append('<style>.ui-icon, .ui-widget-content .ui-icon {background-image: none;}.closeCustomWindow {position: absolute;right: -12px;top: -12px;font-size: 20px;text-align: center;border-radius: 40px;border: 1px solid black;background: transparent linear-gradient(to bottom, #008681 0%, #003533 100%) repeat scroll 0% 0%;width: 30px;}.closeCustomWindow a {text-decoration: none;}.customWindowWrapper {display: none;z-index: 99;position: absolute !important;top: 120px;left: 15%;}.customWindowContent {padding: 5px;border-bottom-right-radius: 5px;border-bottom-left-radius: 5px}.customWindowContent table {width: 100%;font-size: 12px;}.customWindowContent tbody {border: 1px solid #01B0AA;border-top: none;}.customWindowContent th {text-align: center;color: #FF7;border: 1px solid #01B0AA;}.customWindowContent thead th {background-color: #01736D;font-size: 14px;}.customWindowContent td {text-align: center;}.customWindowContent .bRight {border-right: 1px solid #01B0AA;}</style>');
        if(constants.ENABLE_CHAT_BATTLE_SWAP)
            addChatSwap();
        if(constants.ENABLE_CHAT_USER_COLOR_PICKER)
            addChatColorPicker();
    }

    initialize();

    return module;

});