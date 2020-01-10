// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        p_downTime: {
            tooltip: '下降时间',
            type: cc.Float,
            default: 0.25,
        },
        p_centerTime: {
            tooltip: '汇总时间',
            type: cc.Float,
            default: 1.01,
        }
    },

    playerClearScore(score, startPos, endPos) {
        this.node.setPosition(startPos);
        this.lb.string = score;
        //
        let moveDown = cc.moveBy(this.p_downTime, 0, -70);
        this.node.runAction(moveDown);
        this.scheduleOnce(() => {
            let moveCenter = cc.moveTo(this.p_centerTime, endPos);
            this.node.runAction(moveCenter);
            this.scheduleOnce(() => {
                dj.getCanvas().emit('oneClear_clear', score);
                this.node.destroy();
            }, this.p_centerTime);
        }, this.p_downTime);
    },

    onLoad() {
        this.lb = this.node.getComponent(cc.Label);
    },

    start() {
    },

    // update (dt) {},
});
