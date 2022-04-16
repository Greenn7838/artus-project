const mineflayer = require('mineflayer');
const antiafk = require('mineflayer-antiafk');
const autoeat = require('mineflayer-auto-eat');
const config = require('./config.json');
const mcData = require('minecraft-data')(756);
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const IP = config.ip;
const name = config.username;
const loginmsg = config["login-chat"];
const state = ['forward', 'back', 'left', 'right', 'jump', 'sprint', 'sneak'];
const prefix = config["prefix"];

const bot = mineflayer.createBot({
    host: IP,
    username: name,
    hideErrors: true,
    version: "1.17",
});


bot.on('login', function() {
    console.log('Kiểm tra hệ thống đăng nhập... 🔒');
    if (config["login"] === "true") {
        bot.chat(config["register-cmd"]);
        bot.chat(config["login-cmd"]);
        console.log('👍 Đăng nhập thành công, bot đã online ở server');
        bot.chat(loginmsg);
    };
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(antiafk);
bot.loadPlugin(autoeat);

bot.on('physicTick', function() {
    const playerEntity = bot.nearestEntity((entity) => entity.type === 'player');
    if (!playerEntity) return;

    bot.lookAt(playerEntity.position);
});

bot.on('chat', function(username, message) {
    if (username === bot.username) return;

    if (message === `${prefix}hello`) {
        bot.chat('chào');
    };
    if (message === `${prefix}tpa`) {
        bot.chat(`/tpa ${username}`);
    };
    if (message === `${prefix}back`) {
        bot.chat('/back');
    };
});

let goal = null;

function followPlayer(username) {
    const player = bot.players[username];
    if (!playerNearest) {
        bot.chat(`Không thấy ${username}`);
        return;
    }

    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements);
    bot.chat(`Tôi sẽ đi theo ${username}`);
    goal = new goals.GoalFollow(player.entity, 1);
    bot.pathfinder.setGoal(goal, true);
};

function stopFollow() {
    goal = null;
    bot.pathfinder.setMovements(null);
}

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === `${prefix}follow me`) {
        followPlayer(username);
        return;
    };
    if (message === `${prefix}stop`) {
        bot.chat('Tôi sẽ phải dừng di chuyển');
        stopFollow();
    }
})

bot.on('death', function() {
    bot.emit('respawn');
});

bot.on('spawn', () => {
    bot.setOptions({ fishing: false });
    bot.afk.start();
});
bot.on('health', () => {
    if (bot.health < 5) bot.afk.stop();
});