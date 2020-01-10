cc.Class({
    extends: cc.Component,

    properties: {
        p_Space: {
            tooltip: '方块间隔(偶数)',
            type: cc.Integer,
            default: 2,
        },
        p_xyNumber: {
            tooltip: '方块长宽数',
            type: cc.Integer,
            default: 10,
        },
        p_fake: {
            tooltip: '方块预制',
            type: cc.Prefab,
            default: null,
        },
        p_oneScore: {
            tooltip: '方块分数预制',
            type: cc.Prefab,
            default: null,
        },
        p_allScore: {
            tooltip: '方块总分数预制',
            type: cc.Prefab,
            default: null,
        }
    },

    ctor() {
        //消除时间
        this.m_fakeClearTime = 0.15;
        //
        this.m_curScoreNumber = 0;
    },

    // LIFE-CYCLE CALLBACKS:
    clearFakeAll() {
        this.layeFake.removeAllChildren();
    },
    onSetFakerNumbUp(curScore) {
        this.m_curScoreNumber = Math.min(Math.floor(curScore / 1.5e4), dj.constMaxUpNumber);
    },
    onInitGame(level = 1) {
        this.layeFake.y = 1296;
        this.m_fakeArray2 = [];
        this.setLevel(level);
        this.setTargetScore(dj.getLevelInfo(level).score);
        this.layeFake.removeAllChildren();
        this.setGG(false);
        //
        let id = 0;
        let pxyNumber = this.m_curScoreNumber + this.p_xyNumber;
        this.m_onex = this.m_mx / pxyNumber - this.p_Space;
        for (let i = 0; i < pxyNumber; i++) {
            this.m_fakeArray2[i] = [];
            for (let j = 0; j < pxyNumber; j++) {
                //
                let newFake = cc.instantiate(this.p_fake);
                let comFake = newFake.getComponent('fake');
                //
                this.layeFake.addChild(newFake);
                newFake.setPosition(i * this.m_onex + i * this.p_Space + (this.p_Space / 2), j * this.m_onex + j * this.p_Space + (this.p_Space / 2));
                //
                comFake.initFakeAtt(++id, cc.v2(i, j), this.m_onex, comFake.getRandFakeValue(level));
                //
                this.m_fakeArray2[i][j] = comFake;
            }
        }
        //
        this.layeFake.getComponent(cc.Animation).play();
        //test
        /*this.m_fakeArray2[0][0].setValue(0);
        this.m_fakeArray2[0][1].setValue(0);
        this.m_fakeArray2[0][2].setValue(0);
        this.m_fakeArray2[0][3].setValue(0);
        this.m_fakeArray2[1][0].setValue(0);
        this.m_fakeArray2[1][1].setValue(0);*/
    },

    //
    onClearFake(data) {
        if (this.m_bClearing) return;
        let posxy = data;
        let curCom = this.m_fakeArray2[posxy.x][posxy.y];
        let value = curCom.getValue();
        let clearAry = [];
        this.doClear(value, posxy, clearAry);
        //
        if (clearAry.length > 1) {
            this.fakeClearAry(clearAry);
        }
        console.debug(clearAry);
    },
    //
    doClear(value, posxy, posAry) {
        let i = posxy.x;
        let j = posxy.y;
        if (!this.m_fakeArray2[i] || !this.m_fakeArray2[i][j]) {
            return;
        }
        //
        let mvue = this.m_fakeArray2[i][j].getValue();
        //
        if (!this.m_fakeArray2[i][j].getClear() && mvue == value) {
            //
            if (!dj.posArrayHavePos(posAry, posxy)) {
                posAry.push(cc.v2(posxy));
                //
                this.doClear(value, cc.v2(i + 1, j), posAry);
                this.doClear(value, cc.v2(i - 1, j), posAry);
                this.doClear(value, cc.v2(i, j + 1), posAry);
                this.doClear(value, cc.v2(i, j - 1), posAry);
            }
        }
        return;
    },
    //开始清除
    fakeClearAry(aryPos) {
        this.m_bClearing = true;
        const clearYs = 0.012;
        let timeScore = 1;
        let endPos = this.ndTop.getPosition();
        endPos.y -= 35;
        //
        for (let pt of aryPos) {
            let i = pt.x;
            let j = pt.y;
            let fakeCom = this.m_fakeArray2[i][j];
            fakeCom.onKill((timeScore - 1) * clearYs);
            //分数动画
            this.scheduleOnce(function (timeScore) {
                let newScore = cc.instantiate(this.p_oneScore);
                this.node.addChild(newScore);
                let startPos = fakeCom.node.getPosition();
                startPos.y += this.layeFake.y;
                startPos.x += fakeCom.node.width / 2;
                startPos.y += fakeCom.node.height / 2;

                //
                let com = newScore.getComponent('oneClear');
                com.playerClearScore(dj.getClearOneScore(timeScore), startPos, endPos);
            }.bind(this, timeScore), timeScore * clearYs);
            timeScore++;
        }
        //总分动画
        let newAllScore = cc.instantiate(this.p_allScore);
        this.node.addChild(newAllScore);
        let comAllScore = newAllScore.getComponent('allScore');
        let first = aryPos[0];
        let firstNode = this.m_fakeArray2[first.x][first.y];
        let startPos = firstNode.node.getPosition();
        startPos.y += this.layeFake.y;
        startPos.x += firstNode.node.width / 2;
        startPos.y += firstNode.node.height / 2;
        let allScore = dj.getAllClearScore(aryPos.length).sumScore;
        //
        comAllScore.playerAllScore(allScore, startPos);
        //
        this.scheduleOnce(this.fakeClearOver.bind(this, aryPos), timeScore * clearYs + this.m_fakeClearTime);
    },
    //清除完成 下降
    fakeClearOver(aryPos) {
        const time = 0.25;
        let havedown = false;
        //动画
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            //
            for (let j = 0; j < this.m_fakeArray2[i].length; j++) {
                let downFaker = this.m_fakeArray2[i][j];
                if (downFaker.getClear()) continue;
                //未清除检查下移
                let moveCount = 0;
                for (let k = 0; k < j; k++) {
                    let clearFaker = this.m_fakeArray2[i][k];
                    if (clearFaker.getClear()) moveCount++;
                }
                if (moveCount > 0) {
                    //有消除
                    let moveDown = cc.moveBy(time, 0, -(this.m_onex + this.p_Space) * moveCount).easing(cc.easeCubicActionIn());
                    downFaker.node.runAction(moveDown);
                    //
                    havedown = true;
                }
            }
        }
        //逻辑 清除
        let tempos = JSON.parse(JSON.stringify(aryPos));
        dj.sortPosArray(tempos);
        for (let pt of tempos) {
            let i = pt.x;
            let j = pt.y;
            this.m_fakeArray2[i].splice(j, 1);
        }
        //
        this.scheduleOnce(this.onLeftClear.bind(this, aryPos), time + 0.01);
    },
    //左移
    onLeftClear(aryPos) {
        const time = 0.15;
        let havedown = false;
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            if (this.m_fakeArray2[i].length == 0) continue;
            //
            let moveCount = 0;
            for (let j = 0; j < i; j++) {
                if (this.m_fakeArray2[j].length == 0) moveCount++;
            }
            if (moveCount > 0) {
                for (let k = 0; k < this.m_fakeArray2[i].length; k++) {//有消除
                    let moveDown = cc.moveBy(time, -(this.m_onex + this.p_Space) * moveCount, 0).easing(cc.easeCubicActionIn());
                    this.m_fakeArray2[i][k].node.runAction(moveDown);
                }
                havedown = true;
            }
        }
        //逻辑 清除
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            let curFaker = this.m_fakeArray2[i];
            if (curFaker.length == 0) {
                this.m_fakeArray2.splice(i, 1);
                i--;
            }
        }
        this.onSyncFakePos();
        //
        if (havedown) {
            this.scheduleOnce(this.onClearFakeEnd.bind(this), time + 0.01);
        } else {
            this.onClearFakeEnd();
        }
    },
    //同步位置
    onSyncFakePos() {
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            for (let j = 0; j < this.m_fakeArray2[i].length; j++) {
                let faker = this.m_fakeArray2[i][j];
                faker.setPos(i, j);
            }
        }
    },
    //下降完成
    onClearFakeEnd() {
        console.info('#i129 下降完成');
        this.m_bClearing = false;
        this.onPdGameOver();
    },
    //游戏结束判定
    onPdGameOver() {
        let allNum = 0;
        let noClearNum = 0;
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            for (let j = 0; j < this.m_fakeArray2[i].length; j++) {
                if (!this.getPosIsClear(i, j)) noClearNum++;
                allNum++;
            }
        }
        //
        if (allNum == noClearNum) {
            this.doGameOver();
        }
    },
    //游戏结束
    doGameOver() {
        let noClearN = 0;
        for (let i = 0; i < this.m_fakeArray2.length; i++) {
            noClearN += this.m_fakeArray2[i].length;
            for (let j = 0; j < this.m_fakeArray2[i].length; j++) {
                let cuFaker = this.m_fakeArray2[i][j];
                cuFaker.onNoClear();
            }
        }
        console.debug('#dover 游戏结束 有', noClearN, '未消除');
        dj.getCanvas().emit('game_over', noClearN);
    },
    //当前位置方块可消除
    getPosIsClear(i, j) {
        //cur
        let centerFaker = this.m_fakeArray2[i][j];
        //left
        if (this.m_fakeArray2[i - 1]) {
            let cuFaker = this.m_fakeArray2[i - 1][j];
            if (cuFaker && !cuFaker.getClear() && cuFaker.getValue() == centerFaker.getValue()) {
                return true;
            }
        }
        //right
        if (this.m_fakeArray2[i + 1]) {
            let cuFaker = this.m_fakeArray2[i + 1][j];
            if (cuFaker && !cuFaker.getClear() && cuFaker.getValue() == centerFaker.getValue()) {
                return true;
            }
        }
        //up
        if (this.m_fakeArray2[i]) {
            let cuFaker = this.m_fakeArray2[i][j + 1];
            if (cuFaker && !cuFaker.getClear() && cuFaker.getValue() == centerFaker.getValue()) {
                return true;
            }
        }
        //down
        if (this.m_fakeArray2[i]) {
            let cuFaker = this.m_fakeArray2[i][j - 1];
            if (cuFaker && !cuFaker.getClear() && cuFaker.getValue() == centerFaker.getValue()) {
                return true;
            }
        }
        //
        return false;
    },
    onBtSaveHighScore(event, custom) {
        //保存
        if (custom === 'save') {
            let lbHScore = cc.find('currentScore', this.layerHighScore).getComponent(cc.Label);
            let lbName = cc.find('editName', this.layerHighScore).getComponent(cc.EditBox);
            //
            let name = lbName.string || lbName.placeholder;
            let cHighScore = {score: lbHScore.string, name: name};
            dj.getCanvas().emit('high_score_save', cHighScore);
        } else {//取消保存
            dj.getCanvas().emit('high_score_save', null);
        }
        this.setNewHighScore(false, 0);
    },
    onBtShowHighList() {
        this.setHighSceneInfo(true, null);
        dj.getCanvas().emit('show_high_score');
    },
    onBtHideHighList() {
        this.setHighSceneInfo(false, null);
    },
    //
    onLoad() {
        //
        this.layeFake = cc.find('layeFake', this.node);
        //
        this.m_mx = this.node.width;
        //
        this.m_onex = this.m_mx / this.p_xyNumber - this.p_Space;
        //
        dj.getCanvas().on('fake_clear', this.onClearFake.bind(this));
        this.lbCurScore = cc.find('top/currentScore', this.node).getComponent(cc.Label);
        this.lbLevel = cc.find('top/ltitleLevel', this.node).getComponent(cc.Label);
        this.lbTargetScore = cc.find('top/targetScore', this.node).getComponent(cc.Label);
        this.lbHighScore = cc.find('top/highScore', this.node).getComponent(cc.Label);
        this.ndTop = cc.find('top', this.node);
        //
        this.layerChangeLevel = cc.find('layeCenter', this.node);
        this.layerOther = cc.find('layerOther', this.node);
        this.layerGxgg = cc.find('layerGx', this.node);
        this.layerGxggStartPos = this.layerGxgg.getPosition();
        this.layerHighScore = cc.find('layeMaxScore', this.node);
        this.layerHighScene = cc.find('layeHighScene', this.node);
    },
    //
    setGG(bGg) {
        if (bGg == this.layerGxgg.active) return;
        this.layerGxgg.active = bGg;
        if (bGg) {
            this.layerGxgg.getComponent(cc.Animation).play();
        } else {
            this.layerGxgg.setPosition(this.layerGxggStartPos);
        }
    },
    setNewHighScore(bEnable, highScore) {
        this.layerHighScore.active = bEnable;
        if (bEnable) {
            let lbHScore = cc.find('currentScore', this.layerHighScore).getComponent(cc.Label);
            lbHScore.string = highScore;
        }
    },
    setHighSceneInfo(bEnable, scoreInfoString) {
        let lbScoreInfoSl = cc.find('scorearys', this.layerHighScene).getComponent(cc.Label);
        if (scoreInfoString) lbScoreInfoSl.string = scoreInfoString;
        if (bEnable === null) return;
        this.layerHighScene.active = bEnable;
    },
    setLevel(level) {
        this.lbLevel.string = `第 ${level} 关`;
    },
    setCurScore(score) {
        this.lbCurScore.string = `${score}`;
    },
    setHighScore(score) {
        //this.lbHighScore.string = `最高分:${score}`;
    },
    setTargetScore(score) {
        this.lbTargetScore.string = `目标分:${score}`;
    },
    setChangeLevel(level, score) {
        this.layerChangeLevel.children[1].getComponent(cc.Label).string = level;
        this.layerChangeLevel.children[2].getComponent(cc.Label).string = `目标分:${score}`;
        this.scheduleOnce(() => {
            this.layerChangeLevel.getComponent(cc.Animation).play();
        }, 0.5);
    },
    setLastScore(count, score) {
        this.layerOther.children[1].getComponent(cc.Label).string = count;
        if (score > 0) {
            this.layerOther.children[2].getComponent(cc.Label).string = `奖励 ${score} 分`;
        } else {
            this.layerOther.children[2].getComponent(cc.Label).string = ``;
        }
        this.layerOther.getComponent(cc.Animation).play();
    },

    start() {

    },

    // update (dt) {},
});
