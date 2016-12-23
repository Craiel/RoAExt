(function($) {
    'use strict';

    function addChatColorPicker() {
        $('#profileOptionProfile').after(' . <input type="text" id="profileOptionColor" />');

        // Initialize color picker
        $("#profileOptionColor").spectrum({
            showInput: true,
            showInitial: true,
            allowEmpty: true,
            clickoutFiresChange: false,
            change: function(color) {
                if(color == null && ($('#profileOptionUsername').text() in modules.settings.settings.peopleColorData)) {
                    modules.settings.settings.peopleColorData[$('#profileOptionUsername').text()] = 'white';
                    modChatColors();
                    delete modules.settings.settings.peopleColorData[$('#profileOptionUsername').text()];
                }
                else {
                    modules.settings.settings.peopleColorData[$('#profileOptionUsername').text()] = color.toHexString();
                    modChatColors();
                }
            }
        });

        // Add observer to chat to change colors on new comments.
        var observer = new MutationObserver(function( mutations ) {
            mutations.forEach(function( mutation ) {
                if( mutation.addedNodes !== null )
                    modChatColors();
                if($('#profileOptionUsername').text() in modules.settings.settings.peopleColorData)
                    $("#profileOptionColor").spectrum("set", modules.settings.settings.peopleColorData[$('#profileOptionUsername').text()]);
                else {
                    $("#profileOptionColor").spectrum("set", '');
                }
            });
        });
        observer.observe($('#chatMessageList')[0], { childList: true, characterData: true});
        observer.observe($('#profileOptionTooltip')[0], { attributes: true, characterData: true});
    }

    function modChatColors() {
        $('#chatMessageList').find('.profileLink').each(function() {
            if($(this).text() in modules.settings.settings.peopleColorData) {
                var text = $(this).next();
                // Check if this is main channel by the text of the 3rd span. Whispers are special cases, other non-main channels start a [channelName] output.
                var e = $(this).closest('li').find('span:eq(2)').text();
                if(e.indexOf('Whisper') == -1 && e != '[')
                    text.css('color', modules.settings.settings.peopleColorData[$(this).text()]);
            }
        });
    }

    function initialize() {
        addChatColorPicker();
    }

    function ChatPeopleColor() {
        RoAModule.call(this, "Chat People Colors");
    }

    ChatPeopleColor.prototype = Object.spawn(RoAModule.prototype, {
        load: function () {
            initialize();

            RoAModule.prototype.load.apply(this);
        }
    });

    ChatPeopleColor.prototype.constructor = ChatPeopleColor;

    modules.chatPeopleColor = new ChatPeopleColor();

})(modules.jQuery);