var dj = {
    //
    getCanvas: function () {
        return cc.find('Canvas');
    },
    //
    posArrayHavePos: function (ary, pos) {
        for (let pt of ary) {
            if (pos.x == pt.x && pos.y == pt.y) {
                return true;
            }
        }
        return false;
    },
    sortPosArray: function (array) {
        //
        for (let i = 0; i < array.length; i++) {
            for (let j = i + 1; j < array.length; j++) {
                if (array[i].y < array[j].y) {
                    [array[i].x, array[j].x] = [array[j].x, array[i].x];
                    [array[i].y, array[j].y] = [array[j].y, array[i].y];
                }
            }
        }
    },
    //
    getLevelInfo: function (level) {
        let score = 1000;
        //
        const twoup = 500;
        //
        let leveladd = 1500;
        let addTwo = 0;
        for (let i = 1; i < level; i++) {
            if (addTwo == 2) {
                leveladd += twoup;
                addTwo = 0;
            }
            score += leveladd;
            //
            addTwo++;
        }
        return {score};
    },
    //
    getClearOneScore: function (curCount) {
        return 10 * (curCount - 1) + 5;
    },
    //
    getAllClearScore: function (clearCount) {
        let ary = [];
        let sum = 0;
        for (let i = 1; i <= clearCount; i++) {
            let theone = this.getClearOneScore(i);
            ary.push(theone);
            sum += theone;
        }
        return {sumScore: sum, scoreArray: ary};
    },
    getLastScore: function (count) {
        if (count <= 10) {
            return (10 - count) * 100;
        }
        return 0;
    },
    //
    classHighScore: function (score, name) {
        this.titleAry = ["状元", "榜眼", "探花", "四甲", "五甲", "六甲", "七甲", "八甲", "九甲", "十甲"];
        this.score = score;
        this.name = name;
        this.getTitle = (pos) => {
            pos = Number(pos);
            if (this.titleAry[pos]) {
                let Strings = `${this.titleAry[pos]}    ${this.score}    ${this.name}`;
                return Strings;
            }
            return `#error ${pos}`;
        };
    },
    sortList: function (thisArray) {
        for (let i = 0; i < thisArray.length; i++) {
            for (let j = i + 1; j < thisArray.length; j++) {
                //
                if (thisArray[i].score < thisArray[j].score) {
                    [thisArray[i].score, thisArray[i].name, thisArray[j].score, thisArray[j].name] =
                        [thisArray[j].score, thisArray[j].name, thisArray[i].score, thisArray[i].name];
                }
            }
        }
    },
    normalHighList: function () {
        let ary = [];
        for (let i = 0; i < dj.constHighLength; i++) {
            ary.push(new this.classHighScore(10000, "待上榜"));
        }
        return ary;
    },
    getHighListOfJsonSting: function (jsonString) {
        try {
            let array = JSON.parse((jsonString));
            let retArray = [];
            for (let a of array) {
                retArray.push(new this.classHighScore(a._score, a._name));
            }
            return retArray;
        } catch (e) {
            return this.normalHighList();
        }
    },
    getTitleStringOfArrayData: function (arrayData) {
        let retStr = '';
        let ipos = 0;
        for (let data of arrayData) {
            retStr += `${data.getTitle(ipos++)}\n`;
        }

        return retStr;
    },
    getJsonHightStringOfData: function (aryObj) {
        let retStr = '';
        let ary = [];
        for (let o of aryObj) {
            ary.push({score: o.score, name: o.name});
        }
        return JSON.stringify(ary);
    },
};
dj.constHighLength = 10;
dj.constMaxUpNumber = 5;


//
dj.__ = 0;
window.dj = dj;
//
