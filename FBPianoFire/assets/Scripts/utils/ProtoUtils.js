const AudioUtils = require("./AudioUtils");

/*
 * @Author: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @Date: 2024-04-01 23:44:00
 * @LastEditors: shaoshude yinhuanhuan@31724753.onaliyun.com
 * @LastEditTime: 2024-04-02 00:03:05
 * @FilePath: \FBPianoFire\assets\Scripts\utils\PropertyUtils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    addButton()
    {
        cc.Node.prototype['__button'] = null;
        Object.defineProperty(cc.Node.prototype, 'button', {
            get: function () {
                if (this.__button == null)
                {
                    this.__button = this.getComponent(cc.Button);    
                }
                
                return this.__button;
            }
        });

        //通过原型链 拦截按钮点击事件，出发按钮点击音效
        cc.Button.prototype['_onTouchEndedClone'] = cc.Button.prototype._onTouchEnded;
        cc.Button.prototype._onTouchEnded = function(event)
        {
            if (this.interactable && this.enabledInHierarchy)
            {
                AudioUtils.playAudio(AudioUtils.AUDIO.CLICK);    
            }
            
            this._onTouchEndedClone(event);
        }
        
    },

    addLabel()
    {
        cc.Node.prototype['__label'] = null;
        Object.defineProperty(cc.Node.prototype, 'label', {
            get: function () {
                if (this.__label == null)
                {
                    this.__label = this.getComponent(cc.Label);    
                }
                
                return this.__label;
            }
        });
    },

    addSprite()
    {
        cc.Node.prototype['__sprite'] = null;
        Object.defineProperty(cc.Node.prototype, 'sprite', {
            get: function () {
                if (this.__sprite == null)
                {
                    this.__sprite = this.getComponent(cc.Sprite);    
                }
                
                return this.__sprite;
            }
        });
    },
}