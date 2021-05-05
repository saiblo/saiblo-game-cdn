
(function(ns){

var GradeScene = ns.GradeScene = Hilo.Class.create({
    Extends: Hilo.Container,
    constructor: function(properties){
        GradeScene.superclass.constructor.call(this, properties);
        this.init(properties);
    },

    init: function(properties){
        var startBtn = new Hilo.Bitmap({
            id: 'start',
            image: properties.image,
            rect: [590, 0, 290, 176]
        });

        var gradeBtn = new Hilo.Bitmap({
            id: 'grade',
            image: properties.image,
            rect: [590, 176, 290, 176]
        });

        const myRatingText = new Hilo.Text({
            id: 'myRating',
            text: '',
            color: "#FFF",
            scaleX: 5,
            scaleY: 5,
            textAlign: 'center',
        })

        const UNIT_HEIGHT = 60;

        startBtn.x = this.width / 2 - 300;
        startBtn.y = this.height + 338 >> 1;
        gradeBtn.x = startBtn.x + startBtn.width + 20 >> 0;
        gradeBtn.y = startBtn.y;
        myRatingText.x = this.width / 2 - 200;
        myRatingText.y = (this.height + 338 >> 1) - 11.5 * UNIT_HEIGHT
        this.addChild(startBtn, gradeBtn, myRatingText);


        for (let i = 0; i < 10; i++) {
            const text = new Hilo.Text({
                id: 'hn' + i,
                text: '',
                color: "#FFF",
                scaleX: 3,
                scaleY: 3,
            })
            text.x = this.width / 2 - 200;
            text.y = (this.height + 338 >> 1) - (10 - i) * UNIT_HEIGHT;

            const bmt = new Hilo.BitmapText({
                id: 'hs' + i,
                glyphs: properties.numberGlyphs,
                scaleX: 0.5,
                scaleY: 0.5,
                letterSpacing: 5,
            })
            bmt.x = this.width / 2 + 100;
            bmt.y = (this.height + 338 >> 1) - (10 - i) * UNIT_HEIGHT;

            this.addChild(text, bmt);
        }
    },

    show: async function(){
        this.visible = true;
        const {rank, list} = await uFetch('ranking/');
        this.getChildById('myRating').text = 'Your Ranking: ' + rank;
        for (let i = 0; i < 10; i++) {
            if (list[i]) {
                this.getChildById('hn' + i).text = list[i].user__username;
                this.getChildById('hs' + i).setText(list[i].score);
            } else {
                this.getChildById('hn' + i).text = '';
                this.getChildById('hs' + i).setText('');
            }
        }
    },

    hide : function(){
        this.visible = false;
    }
});

})(window.game);
