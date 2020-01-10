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

    properties: {},


    onNewGame() {
        this.m_level = 1;
        this.m_curScore = 0;
        this.m_targetScore = dj.getLevelInfo(this.m_level).score;
        this.comGame.setCurScore(this.m_curScore);
        this.comGame.onSetFakerNumbUp(this.m_curScore);
        this.onUpdateHighScore();
        this.comGame.onInitGame(this.m_level);
        this.comGame.setChangeLevel(this.m_level, this.m_targetScore);
    },
    // LIFE-CYCLE CALLBACKS:
    onUpdateHighScore() {
        //
        let httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
        httpRequest.open('GET', 'http://162.250.97.112:8083/getHighScore', true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
        httpRequest.send();//第三步：发送请求  将请求参数写在URL中
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = () => {
            let jsondata = null;
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                jsondata = httpRequest.responseText;//获取到json字符串，还需解析
            } else {
                jsondata = cc.sys.localStorage.getItem('high_score');
            }
            //
            let arrayData = dj.getHighListOfJsonSting(jsondata);
            this.m_highList = [].concat(arrayData);
            this.m_highScore = this.m_highList[0].score;
            //
            this.comGame.setHighScore(this.m_highScore);
            this.comGame.setHighSceneInfo(null, dj.getTitleStringOfArrayData(this.m_highList));
        };
        //
    },
    ctor() {
        this.m_level = 1;
        this.m_curScore = 0;
        this.m_highScore = 0;
        this.m_highList = null;
        this.m_targetScore = 0;
    },

    onLoad() {
        this.layerGame = cc.find('layerGame', this.node);
        this.comGame = this.layerGame.getComponent('layerGame');
        //on
        dj.getCanvas().on('game_over', this.gameOver.bind(this));
        dj.getCanvas().on('oneClear_clear', this.onGameClearScoreOne.bind(this));
        dj.getCanvas().on('high_score_save', this.onGameHighScoreSave.bind(this));
        dj.getCanvas().on('show_high_score', this.onUpdateHighScore.bind(this));
    },
    gameLose() {
        //
        this.comGame.clearFakeAll();
        let minHighScore = this.m_highList[dj.constHighLength - 1].score;
        if (this.m_curScore > minHighScore) {
            this.comGame.setNewHighScore(true, this.m_curScore);
        } else {
            //
            this.onNewGame();
        }
    },
    onGameClearScoreOne(data) {
        this.m_curScore += Number(data);
        //
        this.comGame.setCurScore(this.m_curScore);
        this.comGame.setGG(this.m_curScore >= this.m_targetScore);
        //
        if (this.m_curScore > this.m_highScore) {
            this.m_highScore = this.m_curScore;
            //cc.sys.localStorage.setItem('high_score', this.m_highScore);
            this.comGame.setHighScore(this.m_highScore);
        }
    },
    /**
     * @param {dj.classHighScore} data
     */
    onGameHighScoreSave: function (data) {
        if (data == null) {
            this.onNewGame();
            return;
        }
        //
        let highScore = Number(data.score);
        let name = data.name;
        //
        let newobj = new dj.classHighScore(highScore, name);
        this.m_highList.push(newobj);
        dj.sortList(this.m_highList);
        this.m_highList.splice(dj.constHighLength, 1);
        console.debug('最终', this.m_highList);
        //

        //
        let httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
        httpRequest.open('GET', `http://162.250.97.112:8083/setHighScore?name=${name}&score=${highScore}`, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
        httpRequest.send();//第三步：发送请求  将请求参数写在URL中
        /**
         * 获取数据后的处理程序
         */
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            } else {
                let jsonstr = dj.getJsonHightStringOfData(this.m_highList);
                cc.sys.localStorage.setItem('high_score', jsonstr);
            }
            //
            this.onUpdateHighScore();

            this.onNewGame();
        };
    },
    gameOver(noClearCount) {
        let winScore = dj.getLastScore(noClearCount);
        this.comGame.setLastScore(noClearCount, winScore);
        //
        this.scheduleOnce(() => {
            this.m_curScore += winScore;
            this.comGame.setCurScore(this.m_curScore);
            this.comGame.setGG(this.m_curScore >= this.m_targetScore);
            //
            this.scheduleOnce(() => {
                let levelInfo = dj.getLevelInfo(this.m_level);
                if (this.m_curScore < levelInfo.score) {
                    this.gameLose();
                } else {
                    this.gameNextLevel();
                }
            }, 1);
        }, 1);
    },
    gameNextLevel() {
        this.comGame.onSetFakerNumbUp(this.m_curScore);
        this.comGame.onInitGame(++this.m_level);
        this.m_targetScore = dj.getLevelInfo(this.m_level).score;
        this.comGame.setChangeLevel(this.m_level, this.m_targetScore);
    },

    start() {
        //
        this.onNewGame();
    },


    // update (dt) {},

    onBt___() {
        dj.__--;
    },

    onBt__() {
        dj.__++;
    },
});
