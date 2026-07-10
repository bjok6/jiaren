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
let reconnectTimeout = null; 

function createBot() {
  const bot = mineflayer.createBot({
    host: '144.31.46.4', 
    port: 14912,               
    username: 'worldhappyz-521',  
    version: false,
    physics: false 
  });

  // 注意：初次登录和死后重生都会触发 'spawn' 事件
  bot.on('spawn', () => {
    console.log('✅ 假人已成功进服/复活！开始原地狂飙演技...');
    bot.physicsEnabled = false; 

    // 清理可能遗留的旧定时器
    if (actionInterval) clearInterval(actionInterval);

    actionInterval = setInterval(() => {
      try {
        // 🚨 新增核心防御：如果假人实体不存在或已死亡，不要发送任何动作数据包
        if (!bot.entity || bot.entity.health <= 0) {
          console.log('⚠️ 假人状态异常 (可能在死亡界面)，跳过本次动作...');
          return;
        }

        bot.swingArm('right'); 
        bot.look(Math.random() * Math.PI * 2, 0); 
        bot.setControlState('sneak', true);
        setTimeout(() => {
          // 确保定时器触发时假人还在
          if (bot && bot.entity) bot.setControlState('sneak', false);
        }, 1000);
        console.log('Bot 执行了高强度体操 (蹲起 + 挥手 + 张望)。');
      } catch (err) {
        console.log('执行动作失败，跳过本次循环。');
      }
    }, 300000); 
  });

  // 🚨 新增：监听死亡事件
  bot.on('death', () => {
    console.log('☠️ 假人不幸阵亡！停止演技，等待自动复活...');
    if (actionInterval) {
      clearInterval(actionInterval);
      actionInterval = null;
    }
  });

  // 记录被服务器踢出的明确原因
  bot.on('kicked', (reason) => {
    console.log('⚠️ 被服务器踢出，原因:', reason);
  });

  bot.on('error', err => console.log('❌ 内部错误:', err));
  
  bot.on('end', () => {
    console.log('⚠️ 连接断开，准备 10 秒后重连...');
    
    // 清理旧的动作定时器
    if (actionInterval) {
      clearInterval(actionInterval);
      actionInterval = null;
    }
    
    // 核心修复：防止开启多个重连任务产生“影分身”
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    reconnectTimeout = setTimeout(createBot, 10000);
  });
}

createBot();
