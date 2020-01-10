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
        p_valueSp: {
            tooltip: '方块集合',
            type: [cc.SpriteFrame],
            default: []
        },
        p_cleanAudio: {
            tooltip: '消除音效',
            type: cc.AudioSource,
            default: null
        },
    },

    //    
    getRandFakeValue(level) {
        let m = this.p_valueSp.length - Math.floor(dj.__ / 20);
        m = Math.max(0, m);
        m = Math.min(this.p_valueSp.length, m);
        return Math.floor(Math.random() * m);
    },
    getValue() {
        return this.m_value;
    },
    //
    initFakeAtt(id, pos, widthH, value) {
        //
        this.node.width = widthH;
        this.node.height = widthH;
        //
        this.m_pos = Object.assign({}, pos);
        //
        this.m_id = id;
        this.m_value = value;
        this.node.getComponent(cc.Sprite).spriteFrame = this.p_valueSp[this.m_value];
    },
    changeFaker(otherFake) {
        [this.m_id, otherFake.m_id] = [otherFake.m_id, this.m_id];
        [this.m_pos.x, otherFake.m_pos.x] = [otherFake.m_pos.x, this.m_pos.x];
        [this.m_pos.y, otherFake.m_pos.y] = [otherFake.m_pos.y, this.m_pos.y];
        [this.m_value, otherFake.m_value] = [otherFake.m_value, this.m_value];
        [this.m_bClear, otherFake.m_bClear] = [otherFake.m_bClear, this.m_bClear];
        //
    },
    onKill(clearTimes) {//
        if (clearTimes < 0.00001) {
            this.node.getComponent(cc.Animation).play();
            this.p_cleanAudio.play();
            this.m_bClear = true;
        } else {
            this.scheduleOnce(this.onKill.bind(this, 0), clearTimes);
        }
    },

    moveDown() {
        this.m_pos.y--;
    },
    moveLeft() {
        this.m_pos.x--;
    },
    getClear() {
        return this.m_bClear;
    },
    getOver() {
        return this.m_bOver;
    },
    setOver(bover) {
        this.m_bOver = bover;
    },
    setPos(x, y) {
        this.m_pos = cc.v2(x, y);
    },
    setValue(value) {
        this.m_value = value;
    },
    // LIFE-CYCLE CALLBACKS:

    onBtnClear() {
        //点 
        dj.getCanvas().emit('fake_clear', this.m_pos);
    },

    //未消除
    onNoClear() {
        this.node.getComponent(cc.Animation).play('noclear');
    },

    ctor() {
        this.m_value = 0;
        this.m_bClear = false;
        this.m_bOver = false;
        /*this.m_valueForColor = [
            new cc.Color(255, 0, 0),
            new cc.Color(0, 255, 0),
            new cc.Color(0, 0, 255),
            new cc.Color(255,255,0),
        new cc.Color(255,0,255)];*/
    },

    onLoad() {
        this.node.on('touchstart', this.onBtnClear.bind(this));
    },

    start() {

    },

    // update (dt) {},
});
