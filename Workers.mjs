// by 鈴奈咲桜
import ical from "node-ical";
import schedule from "node-schedule";
import axios from "axios";
import fs from "fs";

const icsPath = "./kebiao.ics"; // 你的课表文件
const webhookUrl =
  "https://your.wechat.webhook"; // webhook地址

const data = fs.readFileSync(icsPath, "utf8");
const events = ical.parseICS(data);

console.log("==== 上课提醒任务 ====");

let upcoming = []; // 保存未来所有提醒
for (let k in events) {
  const ev = events[k];
  if (ev.type === "VEVENT") {
    let startTimes = [];
    if (ev.rrule) {
      startTimes = ev.rrule.all();
    } else if (ev.start) {
      startTimes = [ev.start];
    }

    for (let start of startTimes) {
      const remindTimes = [
        new Date(start.getTime() - 30 * 60 * 1000), // 提前 30 分钟
        new Date(start.getTime() - 15 * 60 * 1000), // 提前 15 分钟
      ];

      for (let remindTime of remindTimes) {
        if (remindTime > new Date()) {
          upcoming.push({ ev, start, remindTime });
        }
      }
    }
  }
}

// 按提醒时间排序
upcoming.sort((a, b) => a.remindTime - b.remindTime);

if (upcoming.length === 0) {
  console.log("近期没有需要提醒的课程。");
} else {
  // 最近的一次提醒
  const first = upcoming[0];
  console.log(
    `最近提醒: ${first.ev.summary} | 上课时间: ${first.start.toLocaleString()} | 提醒时间: ${first.remindTime.toLocaleString()}`
  );

  // 启动时推送一次测试提醒
  await sendReminder(first.ev, first.start, true);

  // 注册所有提醒
  for (const { ev, start, remindTime } of upcoming) {
    schedule.scheduleJob(remindTime, () => sendReminder(ev, start, false));
  }
}

console.log("========================");

async function sendReminder(ev, start, isTest = false) {
  const header = isTest ? "[本次为测试提醒（可以不理会）]\n" : "**上课提醒**\n";
  const text =
    `${header}` +
    `课程：${ev.summary}\n` +
    `地点：${ev.location}\n` +
    `时间：${start.toLocaleString()}`;

  const payload = {
    msgtype: "markdown",
    markdown: {
      content: text,
    },
  };

  try {
    const res = await axios.post(webhookUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("提醒已发送:", text);
    console.log("服务器返回:", res.data);
  } catch (err) {
    console.error("发送失败:", err.message);
    if (err.response) {
      console.error("响应状态:", err.response.status);
      console.error("响应内容:", err.response.data);
    }
  }
}
