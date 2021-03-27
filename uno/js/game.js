var game = {};
var PLAYER_COUNT = 6;
var INIT_CARD_COUNT = 7;

// var playerAvatars = new Array(PLAYER_COUNT);
// var playerNames = new Array(PLAYER_COUNT);
var playerAvatars;
var playerNames;
var playerScores;
// var playerScores = [0,0,0,0,0,0];

function nextPlayer(index) {
    return (index + 1) % PLAYER_COUNT;
}

function prevPlayer(index) {
    return (index - 1 + PLAYER_COUNT) % PLAYER_COUNT;
}

game.start = function(){
    // 初始化一些全局的东西
    console.log(PLAYER_COUNT);
    playerAvatars = new Array(PLAYER_COUNT);
    playerScores = new Array(PLAYER_COUNT);
    playerNames = new Array(PLAYER_COUNT);
    for (var i = 0; i < PLAYER_COUNT; i ++) {
        playerScores[i] = 0;
        playerNames[i] = (parseInt(i + parseInt(game.position)) % PLAYER_COUNT) + "号玩家"
        console.log(playerNames[i]);
    }

    game.currentSeason = 0;

    //初始化排名信息
    // game.showPlayerOrder();

    // 游戏是否自动结束
    game.autoEnd = false;

    pageNotifier.setPlayerInfo(playerAvatars, playerNames);

    game.onStart();
};

game.onStart = function(){
    // game.players
    game.createPlayers();

    // 初始化牌
    game.cards = getShuffledCards();

    // 初始化Player手牌
    // game.initPlayerCards();

    // game.outCount
    game.outCount = 0;

    // 累加的牌的数量 +2 +4
    game.plusCard = 0;

    game.started = false;

    // 初始化上一张出来的牌
    game.lastCard = null;

    // 暂时从user开始，以后会随机开始位置
    game.direction = true;

    game.lastPlayer = game.position;
    // game.currentActivePlayerIndex = 0;
    // game.players[game.currentActivePlayerIndex].active(game.lastCard, game.plusCard);
};

game.restart = function(){
    pageNotifier.notifyRestart();
    if ( ! game.autoEnd){
        game.shouldRestart = true;
    }
    setTimeout(function(){game.onStart();}, 1000);
};

game.createPlayers = function(){
    game.players = new Array(PLAYER_COUNT);
    game.players[0] = createUser();
    game.user = game.players[0];
    game.players[0].setGame(game, 0, pageNotifier);
    for(var i = 1; i < PLAYER_COUNT; i ++) {
        game.players[i] = createRobot();
        game.players[i].setGame(game, i, pageNotifier);
    }
};

game.updatePlayerIndex = function(playerIndex) {
    var index = playerIndex - game.position;
    if (index < 0)
        index += PLAYER_COUNT;
    return index;
}

game.getNextPlayer = function(){
    if (game.direction){
        game.currentActivePlayerIndex ++;
    } else {
        game.currentActivePlayerIndex --;
    }

    if (game.currentActivePlayerIndex >= PLAYER_COUNT){
        game.currentActivePlayerIndex = game.currentActivePlayerIndex - PLAYER_COUNT;
    }
    if (game.currentActivePlayerIndex < 0){
        game.currentActivePlayerIndex = game.currentActivePlayerIndex + PLAYER_COUNT;
    }
    return game.players[game.currentActivePlayerIndex];
};

game.backDirection = function(){
    game.direction = !game.direction;
    pageNotifier.notifyDirectionChanged(game.direction);
};

game.initPlayerCards = function(){
    for(var i = 0; i < PLAYER_COUNT; i ++){
        game.players[i].getCards(game.popCards(INIT_CARD_COUNT));
    }
};

// 从牌堆顶部取count张牌
game.popCards = function(count){
    var outCards = new Array(count);
    if (count >= game.cards.length){
        var newCards = getShuffledCards();
        game.cards = newCards.concat(game.cards);
    }
    for(var i = 0; i < count; i ++){
        outCards[i] = game.cards.pop();
    }
    return outCards;
};

game.updateUserCards = function(data) {
    for (var i = 0; i < PLAYER_COUNT; i ++) {
        var playerCard = data[i.toString()];
        if (i == 0) {
            // Here player card is string array.
            game.players[i].getCards(playerCard);
        } else {
            // Here player card is number.
            game.players[i].getCards(playerCard);
        }
    }
};

/**
 *
 * @param playerIndex 玩家位置
 * @param card 出的牌
 * @param cardIndex 如果是玩家出牌，则给出该牌的位置，方便做动画效果
 */
game.sendCard = function(playerIndex, card, cardIndex){

    if (game.shouldRestart){
        game.shouldRestart = false;
        return 0;
    }

    var nextPlayer;

    // 没有出牌
    if (null == card){

        // 1.正常色卡，没牌出
        // 2.连加后没牌出

        game.client.sendCard(null, -1);

        /*if (0 == game.plusCard){
            nextPlayer = game.players[playerIndex];
            nextPlayer.getCards(game.popCards(1));
            nextPlayer = game.getNextPlayer();
            game.delayActive(nextPlayer);
            consoleLog(" 没有出牌，拿一张牌", playerNames[playerIndex] + "：");
            return 0;
        } else{
            nextPlayer = game.players[playerIndex];
            nextPlayer.getCards(game.popCards(game.plusCard));
            consoleLog(" 没有出牌，拿" + game.plusCard + "张牌" , playerNames[playerIndex] + "：");
            game.plusCard = 0;
            game.lastCard = createCard(TYPE_ALL, 1, game.lastCard.color);
            game.delayActive(nextPlayer);
            return 0;
        }*/
    }

    isCardCanSend(game.lastCard, card);
    if ( ! card.canSend){
        // alert(playerNames[playerIndex] + "： " + COLORS[card.color] + " " + CONTENT[card.type][card.content] + "\n出牌错误，请重新出牌. " + playerIndex + "号");
        consoleLog(" 出牌错误，重新出牌" , playerNames[playerIndex] + "：");
        game.delayActive(game.players[playerIndex]);
        return 0;
    }

    // game.outCount ++;
    game.lastPlayer = playerIndex;

    // 出牌动画
    if (playerIndex == 0){
        // 如果是玩家出牌，则有不同的动画效果
        game.client.sendCard(card, cardIndex);
        // pageNotifier.showRobotSendCardAnim(playerIndex, card, game.outCount);
    } else {
        // 机器人出牌动画
        // pageNotifier.showRobotSendCardAnim(playerIndex, card, game.outCount);
        console.log("This line should not be run.")
    }

    // 桌子上牌过多
    if (game.outCount >= 11) {
        var c = game.outCount;
        game.outCount = 4;
        setTimeout(function(){pageNotifier.clearOutCardWhenTooMany(c, 4);}, 0);
    }

    consoleLog(COLORS[card.color] + " " + CONTENT[card.type][card.content], playerNames[playerIndex] + "： ");

/*
    // 判断当前player是否还有牌，没牌的话结束游戏
    if (game.players[playerIndex].cards.length <= 0){

        game.autoEnd = true;

        // 计分
        for (var ii = 0; ii < PLAYER_COUNT; ii ++){
            playerScores[ii] += getCardsScore(game.players[ii].cards);
        }

        game.showPlayerOrder();

        setTimeout(function(){alert("游戏结束：" + playerNames[playerIndex] + " 获胜");}, 600);
        return ;
    }

    game.lastCard = card;


    // 回 停 +2，+4 正常牌
    if (isBack(card)){
        game.backDirection();
        var player = game.getNextPlayer();
    } else if (isStop(card)){
        player = game.getNextPlayer();
        player = game.getNextPlayer();
    } else if (isPlusTwo(card)){
        player = game.getNextPlayer();
        game.plusCard += 2;
    } else if (isPlusFour(card)){
        player = game.getNextPlayer();
        game.plusCard += 4;
    } else {
        player = game.getNextPlayer();
    }
*/

    // game.delayActive(player);

    //TODO 0 UNO
};

game.sendOtherCard = function(playerIndex, card) {
    if (playerIndex == -1)
        return 0;
    game.outCount ++;
    pageNotifier.showRobotSendCardAnim(playerIndex, card, game.outCount);

    if (game.outCount >= 11){
        var c = game.outCount;
        game.outCount = 4;
        setTimeout(function(){pageNotifier.clearOutCardWhenTooMany(c, 4);}, 0);
    }
}

var orderUser = function(p1, p2){
    if (p1.score <= p2.score){
        return 1;
    } else {
        return -1;
    }
};

game.showPlayerOrder = function(){
    var us = new Array(PLAYER_COUNT);
    for (var i = 0; i < PLAYER_COUNT; i ++){
        var u = {};
        u.name = playerNames[i];
        u.score = playerScores[i];
        us[i] = u;
    }
    us.sort(orderUser);
    pageNotifier.showUserOrder(us);
};


game.delayActive = function(player){
    setTimeout(function(){player.active(game.lastCard, game.plusCard);}, 800);
};