const bot = require('./index').bot;
const handlers = require('./handlers');
const requiredChannels = require('./channels').requiredChannels;

module.exports = (bot, handlers, requiredChannels) => {
    return {
        mainKeyboard: [
            [
                {
                    text: 'Channels',
                    callback_data: 'channels'
                }
            ],
    
            [
                {
                    text: 'Start',
                    callback_data: 'start'
                }
            ],
    
            [
                {
                    text: 'Open web',
                    web_app: {
                        url: 'https://cryptic-caverns-38004-f55e3bfbd857.herokuapp.com/'
                    }
                }
            ]
        ],
    
        youtubeKeyboard: [
            [
                {
                    text: 'Queen Tech',
                    url: 'https://www.youtube.com/watch?v=hmSSQv4AyGU'
                },
        
                {
                    text: 'Crypto Levy',
                    url: 'https://www.youtube.com/@cryptolevy?si=QXQimY13s4CSMaPu'
                },
        
                {
                    text: 'Mega Cash',
                    url: 'https://www.youtube.com/@cashmega?si=I7MIP1Hcpou3nAeY'
                }
            ]
        ]
    };
};