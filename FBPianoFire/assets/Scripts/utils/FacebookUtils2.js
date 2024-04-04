
const AudioUtils = require("./AudioUtils");
const FacebookUtils = require("./FacebookUtils");
const UIUtils = require("./UIUtils");

module.exports = {
    
    
    initFullFromExternal(_initFull)
    {
        if (FacebookUtils.isMinFullDelta()) {
            FacebookUtils.initFullAD();
        }
    },

    initVideoFromExternal(_initVideo) {
        
        if (FacebookUtils.isMinVideoDelta()) {
            FacebookUtils.initVideoAD();
        }
    },

    displayFullFromExternal(wait,callback) { 

        let displayCall = () => { 

            AudioUtils.playMute();

            FacebookUtils.displayFullAD(() => {

                callback && callback();
            })

        }


        if (FacebookUtils.isFullADLoading() && wait) {

            UIUtils.displayMask(true);
            
            let t = setTimeout(() => {

                UIUtils.displayMask(false);

                FacebookUtils.loadFullFinishCallBack = null;
                
                displayCall();

            }, 5000)
            
            FacebookUtils.loadFullFinishCallBack = () => {

                UIUtils.displayMask(false);

                clearTimeout(t);
                displayCall();
            };

        }
        else displayCall();
    },

    
    displayVideoFromExternal(initBefore,callback) { 

        let displayCall = () => { 


            if (FacebookUtils.isVideoADLoad()) {

                AudioUtils.playMute();
                
                
                FacebookUtils.displayVideoAD((state) => {

                    callback && callback(state);
                })
            }
            else {
                UIUtils.displayHint("no ads");
                callback && callback(false);
                
             }
        }

        this.initVideoFromExternal(initBefore);
        
        if (FacebookUtils.isVideoADLoading()) {

            UIUtils.displayMask(true);

            let t = setTimeout(() => {

                UIUtils.displayMask(false);
                
                FacebookUtils.loadVideoFinishCallBack = null;
                
                displayCall();

            }, 5000)
            
            FacebookUtils.loadVideoFinishCallBack = () => {

                UIUtils.displayMask(false);
                
                clearTimeout(t);
                displayCall();
            };

        }
        else displayCall();
    },

    
    displayBannerFromExternal(callback)
    { 
        FacebookUtils.displayBanner((state) =>
        { 
            if (FacebookUtils.isIOS()) return;
        });
    },

}