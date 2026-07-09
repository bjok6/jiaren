const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.send('Docker Bot is running strong!'); 
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Web 服务已在容器端口 ${port} 启动`);
});

let actionInterval = null; 
let reconnectTimeout = null; // 新增：重连锁

function createBot() {
  const bot = mineflayer.createBot({
    host: '163.5.201.4', 
    port: 13943,               
    username: 'worldhappy0',  
    version: false,
    physics: false 
  });

  bot.on('spawn', () => {
    console.log('✅ 假人已成功进服！开始原地狂飙演技...');
    bot.physicsEnabled = false; 

    if (actionInterval) clearInterval(actionInterval);

    actionInterval = setInterval(() => {
      try {
        bot.swingArm('right'); 
        bot.look(Math.random() * Math.PI * 2, 0); 
        bot.setControlState('sneak', true);
        setTimeout(() => bot.setControlState('sneak', false), 1000);
        console.log('Bot 执行了高强度体操 (蹲起 + 挥手 + 张望)。');
      } catch (err) {
        console.log('执行动作失败，等待重连...');
      }
    }, 300000); 
  });

  // 记录被服务器踢出的明确原因
  bot.on('kicked', (reason) => {
    console.log('⚠️ 被服务器踢出，原因:', reason);
  });

  bot.on('error', err => console.log('❌ 内部错误:', err));
  
  bot.on('end', () => {
    console.log('⚠️ 连接断开，准备重连...');
    
    // 清理旧的动作定时器
    if (actionInterval) {
      clearInterval(actionInterval);
      actionInterval = null;
    }
    
    // 🚨 核心修复：防止开启多个重连任务产生“影分身”
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    reconnectTimeout = setTimeout(createBot, 10000);
  });
}

createBot();
