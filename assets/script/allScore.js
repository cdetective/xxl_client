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
        p_Time: {
            tooltip: '汇总时间',
            type: cc.Float,
            default: 1.01,
        }
    },

    // LIFE-CYCLE CALLBACKS:
    playerAllScore(score, startPos) {
        this.node.setPosition(startPos);
        this.lb.string = score;
        //
        let moveDown = cc.moveBy(this.p_Time, 0, 120);
        let scaleTo = cc.scaleTo(this.p_Time / 2, 1.2);
        let spaw = cc.spawn(scaleTo, moveDown);
        this.node.runAction(spaw);
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.p_Time + 0.1);
    },

    onLoad() {
        this.lb = this.node.getComponent(cc.Label);
    },

    start() {

    },

    // update (dt) {},
});
