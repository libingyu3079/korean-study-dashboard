const authKey = "korean-study-authenticated";
const users = [
  { id: "learner-01", name: "学习者 1", code: "hangul2026" },
  { id: "learner-02", name: "学习者 2", code: "topik2026" },
  { id: "learner-03", name: "学习者 3", code: "korea2026" }
];
const storageKeyFor = (userId) => `korean-study-dashboard-v1-${userId || "guest"}`;
const pad = (value) => String(value).padStart(2, "0");
const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const todayKey = () => toDateKey(new Date());

const defaultState = {
  name: "",
  dailyGoal: 30,
  reminderTime: "20:30",
  tasks: {},
  minutes: {},
  checkins: [],
  mastered: [],
  activeSound: "아",
  planStartDate: "2026-06-02",
  completedPlan: []
};

const dailyTasks = [
  "复习 10 个韩语单词",
  "跟读 5 分钟发音",
  "学习 1 个语法点并造 3 个句子",
  "听 1 段 TOPIK I 短对话"
];

const phaseNames = ["韩文字母", "基础句子", "TOPIK I 1级", "TOPIK I 2级冲刺"];
const hangulFocus = [
  "元音 ㅏ/ㅓ/ㅗ/ㅜ/ㅡ/ㅣ",
  "辅音 ㄱ/ㄴ/ㄷ/ㄹ/ㅁ",
  "辅音 ㅂ/ㅅ/ㅇ/ㅈ/ㅎ",
  "双元音 ㅐ/ㅔ/ㅘ/ㅝ/ㅢ",
  "收音 ㄱ/ㄴ/ㄷ/ㄹ/ㅁ/ㅂ/ㅇ",
  "连音、鼻音化和紧音化",
  "字母总复习与听写"
];
const basicTopics = ["问候与自我介绍", "数字、日期和时间", "地点、位置和方向", "饮食、购物和价格", "家庭、职业和爱好", "日常动作与敬语"];
const grammarTopics = ["은/는 和 이/가", "을/를 和 에/에서", "아/어 요 现在时", "았/었어요 过去时", "고 싶어요 愿望", "고/지만 连接句子", "세요 和 敬语请求"];
const topikTopics = ["短对话听力", "公告与表格阅读", "人物和地点描述", "日程与邀请", "购物和服务场景", "错题复盘"];
const sprintTopics = ["TOPIK I 听力套题", "TOPIK I 阅读套题", "高频词回炉", "易错语法整理", "限时模拟", "考前复盘"];

const sounds = [
  { text: "아", name: "元音 ㅏ", roman: "a", approx: "啊", example: "아이 a-i，孩子", tip: "嘴巴自然张开，发接近中文“啊”的声音。" },
  { text: "어", name: "元音 ㅓ", roman: "eo", approx: "哦/呃之间", example: "어머니 eo-meo-ni，妈妈", tip: "嘴型比 ㅏ 更收，声音靠后。" },
  { text: "오", name: "元音 ㅗ", roman: "o", approx: "哦", example: "오이 o-i，黄瓜", tip: "嘴唇收圆，声音短而稳。" },
  { text: "우", name: "元音 ㅜ", roman: "u", approx: "乌", example: "우유 u-yu，牛奶", tip: "嘴唇更收圆，声音位置靠后。" },
  { text: "이", name: "元音 ㅣ", roman: "i", approx: "一", example: "이름 i-reum，名字", tip: "嘴角微微展开，接近中文“一”。" },
  { text: "가", name: "辅音 ㄱ", roman: "ga/ka", approx: "轻 g", example: "가방 ga-bang，包", tip: "介于中文 g 和 k 之间，开头不要太重。" },
  { text: "나", name: "辅音 ㄴ", roman: "na", approx: "那", example: "나라 na-ra，国家", tip: "舌尖抵住上齿龈，发 n 音。" },
  { text: "다", name: "辅音 ㄷ", roman: "da/ta", approx: "轻 d", example: "다리 da-ri，腿/桥", tip: "舌尖轻触上齿龈，声音短促。" },
  { text: "라", name: "辅音 ㄹ", roman: "ra/la", approx: "r/l 之间", example: "라면 ra-myeon，拉面", tip: "舌尖轻弹，介于 l 和 r 之间。" },
  { text: "마", name: "辅音 ㅁ", roman: "ma", approx: "马", example: "마음 ma-eum，心", tip: "双唇闭合后打开，发 m 音。" },
  { text: "바", name: "辅音 ㅂ", roman: "ba/pa", approx: "轻 b", example: "바다 ba-da，大海", tip: "双唇轻闭，介于 b 和 p 之间。" },
  { text: "사", name: "辅音 ㅅ", roman: "sa", approx: "撒", example: "사람 sa-ram，人", tip: "气流从齿间通过，接近 s。" },
  { text: "자", name: "辅音 ㅈ", roman: "ja/cha", approx: "轻 j", example: "자동차 ja-dong-cha，汽车", tip: "接近 j，但更轻更短。" },
  { text: "하", name: "辅音 ㅎ", roman: "ha", approx: "哈", example: "하루 ha-ru，一天", tip: "带明显气流，像轻轻哈气。" }
];

let state = loadState();

const els = {
  learnerName: document.querySelector("#learnerName"),
  dailyGoal: document.querySelector("#dailyGoal"),
  reminderTime: document.querySelector("#reminderTime"),
  enableReminder: document.querySelector("#enableReminder"),
  todayTitle: document.querySelector("#todayTitle"),
  streakCount: document.querySelector("#streakCount"),
  taskList: document.querySelector("#taskList"),
  taskTemplate: document.querySelector("#taskTemplate"),
  minutesInput: document.querySelector("#minutesInput"),
  saveMinutes: document.querySelector("#saveMinutes"),
  resetToday: document.querySelector("#resetToday"),
  checkIn: document.querySelector("#checkIn"),
  todayPercent: document.querySelector("#todayPercent"),
  checkinHint: document.querySelector("#checkinHint"),
  currentHangul: document.querySelector("#currentHangul"),
  currentName: document.querySelector("#currentName"),
  currentRoman: document.querySelector("#currentRoman"),
  currentApprox: document.querySelector("#currentApprox"),
  currentTip: document.querySelector("#currentTip"),
  currentExample: document.querySelector("#currentExample"),
  playCurrent: document.querySelector("#playCurrent"),
  markMastered: document.querySelector("#markMastered"),
  hangulGrid: document.querySelector("#hangulGrid"),
  voiceRate: document.querySelector("#voiceRate"),
  voiceSelect: document.querySelector("#voiceSelect"),
  voiceHint: document.querySelector("#voiceHint"),
  totalMinutes: document.querySelector("#totalMinutes"),
  checkedDays: document.querySelector("#checkedDays"),
  masteredSounds: document.querySelector("#masteredSounds"),
  barChart: document.querySelector("#barChart"),
  goalLabel: document.querySelector("#goalLabel"),
  exportData: document.querySelector("#exportData"),
  planStartDate: document.querySelector("#planStartDate"),
  jumpToday: document.querySelector("#jumpToday"),
  dailySchedule: document.querySelector("#dailySchedule"),
  scheduleSummary: document.querySelector("#scheduleSummary"),
  authScreen: document.querySelector("#authScreen"),
  loginForm: document.querySelector("#loginForm"),
  accessCode: document.querySelector("#accessCode"),
  loginMessage: document.querySelector("#loginMessage"),
  logoutButton: document.querySelector("#logoutButton")
};

function refreshAuth() {
  const userId = sessionStorage.getItem(authKey);
  const isKnownUser = users.some((user) => user.id === userId);
  document.body.classList.toggle("locked", !isKnownUser);
}

function loadState() {
  try {
    const userId = sessionStorage.getItem(authKey);
    const user = users.find((item) => item.id === userId);
    const saved = JSON.parse(localStorage.getItem(storageKeyFor(userId)));
    return { ...defaultState, name: user?.name || "", ...saved };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  const userId = sessionStorage.getItem(authKey);
  localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
}

function getTodayTasks() {
  const key = todayKey();
  const taskTexts = getDailyTaskTexts(key);
  const existing = state.tasks[key] || [];
  const existingTexts = existing.map((task) => task.text).join("|");
  if (!existing.length || existingTexts !== taskTexts.join("|")) {
    state.tasks[key] = taskTexts.map((text) => ({
      text,
      done: Boolean(existing.find((task) => task.text === text && task.done))
    }));
  }
  return state.tasks[key];
}

function getDailyTaskTexts(dateKey) {
  const plan = getPlanForDate(dateKey);
  return plan ? plan.tasks : dailyTasks;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysBetween(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  return Math.round((end - start) / 86400000);
}

function getPlanForDate(dateKey) {
  const index = daysBetween(state.planStartDate, dateKey);
  if (index < 0 || index >= 180) return null;
  return buildPlanDay(index);
}

function buildPlanDay(index) {
  const day = index + 1;
  const weekday = index % 7;
  if (day <= 14) {
    const focus = hangulFocus[weekday];
    return {
      phase: phaseNames[0],
      title: `第 ${day} 天：${focus}`,
      tasks: weekday === 6
        ? ["听写 20 个音节", "复读所有已学字母 3 遍", "录音 1 分钟并检查发音"]
        : [`学习 ${focus}`, "跟读 10 分钟", "写 20 个音节组合", "用发音区播放并标记掌握"]
    };
  }
  if (day <= 60) {
    const week = Math.floor((day - 15) / 7);
    const topic = basicTopics[week % basicTopics.length];
    const grammar = grammarTopics[index % grammarTopics.length];
    return {
      phase: phaseNames[1],
      title: `第 ${day} 天：${topic}`,
      tasks: weekday === 6
        ? [`复习本周主题：${topic}`, "做 20 题小测", "整理 5 个错题或不熟句子"]
        : [`背 15 个${topic}词汇`, `学习语法：${grammar}`, "造 3 个韩语句子", "听读 1 段短对话"]
    };
  }
  if (day <= 120) {
    const topic = topikTopics[index % topikTopics.length];
    return {
      phase: phaseNames[2],
      title: `第 ${day} 天：${topic}`,
      tasks: weekday === 6
        ? ["完成一组 TOPIK I 听力+阅读小测", "记录正确率", "复盘错题并补 20 个词"]
        : [`练习 ${topic}`, "背 20 个 TOPIK I 高频词", "精听 1 段并跟读", "阅读 1 篇短文"]
    };
  }
  const topic = sprintTopics[index % sprintTopics.length];
  return {
    phase: phaseNames[3],
    title: `第 ${day} 天：${topic}`,
    tasks: weekday === 6
      ? ["做一次限时模拟", "统计听力和阅读分数", "写下下周最该补的 3 个点"]
      : [`完成 ${topic}`, "复习 30 个错题词", "整理 1 个易错语法", "朗读短文 2 遍"]
  };
}

function render() {
  els.learnerName.value = state.name;
  els.dailyGoal.value = String(state.dailyGoal);
  els.reminderTime.value = state.reminderTime;
  els.planStartDate.value = state.planStartDate;
  els.todayTitle.textContent = state.name ? `${state.name}，今天继续前进` : "今天学一点韩语";
  els.goalLabel.textContent = `目标 ${state.dailyGoal} 分钟/天`;
  renderTasks();
  renderSoundLab();
  renderProgress();
  renderSchedule();
}

function renderTasks() {
  const tasks = getTodayTasks();
  els.taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const node = els.taskTemplate.content.firstElementChild.cloneNode(true);
    const input = node.querySelector("input");
    const label = node.querySelector("span");
    input.checked = task.done;
    label.textContent = task.text;
    input.addEventListener("change", () => {
      task.done = input.checked;
      saveState();
      renderProgress();
    });
    els.taskList.appendChild(node);
  });
}

function renderSoundLab() {
  const current = sounds.find((sound) => sound.text === state.activeSound) || sounds[0];
  els.currentHangul.textContent = current.text;
  els.currentName.textContent = current.name;
  els.currentRoman.textContent = current.roman;
  els.currentApprox.textContent = `近似：${current.approx}`;
  els.currentTip.textContent = current.tip;
  els.currentExample.textContent = `例词：${current.example}`;
  els.hangulGrid.innerHTML = "";

  sounds.forEach((sound) => {
    const button = document.createElement("button");
    button.className = "sound-tile";
    if (sound.text === current.text) button.classList.add("active");
    if (state.mastered.includes(sound.text)) button.classList.add("mastered");
    button.type = "button";
    button.innerHTML = `<strong>${sound.text}</strong><em>${sound.roman}</em><small>${sound.approx}</small>`;
    button.addEventListener("click", () => {
      state.activeSound = sound.text;
      saveState();
      speak(sound.text);
      renderSoundLab();
    });
    els.hangulGrid.appendChild(button);
  });
}

function populateVoices() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const koreanVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("ko"));
  els.voiceSelect.innerHTML = `<option value="">自动选择韩语声音</option>`;
  koreanVoices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    els.voiceSelect.appendChild(option);
  });
  els.voiceHint.textContent = koreanVoices.length
    ? "点“播放”听韩语发音，再跟读 3 遍。"
    : "当前浏览器没有检测到韩语声音；播放可能静音或不标准。";
}

function renderProgress() {
  const key = todayKey();
  const tasks = getTodayTasks();
  const taskPercent = tasks.filter((task) => task.done).length / tasks.length;
  const minutePercent = Math.min((state.minutes[key] || 0) / state.dailyGoal, 1);
  const percent = Math.round(((taskPercent + minutePercent) / 2) * 100);

  els.todayPercent.textContent = `${percent}%`;
  document.querySelector(".checkin-ring").style.setProperty("--progress", `${percent}%`);
  els.streakCount.textContent = getStreak();
  els.totalMinutes.textContent = Object.values(state.minutes).reduce((sum, value) => sum + Number(value || 0), 0);
  els.checkedDays.textContent = state.checkins.length;
  els.masteredSounds.textContent = state.mastered.length;
  els.checkinHint.textContent = state.checkins.includes(key)
    ? "今天已经打卡，明天继续保持。"
    : "完成任务后点这里，系统会保存你的学习记录。";
  renderBars();
}

function renderSchedule() {
  els.dailySchedule.innerHTML = "";
  const start = parseDateKey(state.planStartDate);
  const end = addDays(start, 179);
  els.scheduleSummary.textContent = `${state.planStartDate} 到 ${toDateKey(end)}`;

  Array.from({ length: 180 }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const plan = buildPlanDay(index);
    const article = document.createElement("article");
    article.id = `plan-${dateKey}`;
    article.className = "schedule-day";
    if (dateKey === todayKey()) article.classList.add("today");
    if (state.completedPlan.includes(dateKey)) article.classList.add("done");
    article.innerHTML = `
      <div class="schedule-date">
        <strong>${dateKey}</strong>
        <small>第 ${index + 1} 天</small>
        <span class="schedule-phase">${plan.phase}</span>
      </div>
      <div class="schedule-body">
        <h4>${plan.title}</h4>
        <ul>${plan.tasks.map((task) => `<li>${task}</li>`).join("")}</ul>
      </div>
      <input class="schedule-check" type="checkbox" aria-label="完成 ${dateKey}" ${state.completedPlan.includes(dateKey) ? "checked" : ""} />
    `;
    article.querySelector("input").addEventListener("change", (event) => {
      if (event.target.checked && !state.completedPlan.includes(dateKey)) {
        state.completedPlan.push(dateKey);
      }
      if (!event.target.checked) {
        state.completedPlan = state.completedPlan.filter((day) => day !== dateKey);
      }
      saveState();
      renderSchedule();
    });
    els.dailySchedule.appendChild(article);
  });
}

function renderBars() {
  els.barChart.innerHTML = "";
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return date.toISOString().slice(0, 10);
  });

  days.forEach((day) => {
    const value = Number(state.minutes[day] || 0);
    const height = Math.max(4, Math.min(100, (value / state.dailyGoal) * 100));
    const wrapper = document.createElement("div");
    wrapper.className = "bar";
    wrapper.title = `${day}: ${value} 分钟`;
    wrapper.innerHTML = `
      <div class="bar-fill" style="height:${height}%"></div>
      <time>${day.slice(5).replace("-", "/")}</time>
    `;
    els.barChart.appendChild(wrapper);
  });
}

function getStreak() {
  let streak = 0;
  const checked = new Set(state.checkins);
  const date = new Date();
  while (checked.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("当前浏览器不支持语音播放。");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = Number(els.voiceRate.value);
  const voices = window.speechSynthesis.getVoices();
  const selected = voices.find((voice) => voice.name === els.voiceSelect.value);
  utterance.voice = selected || voices.find((voice) => voice.lang.toLowerCase().startsWith("ko")) || null;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function scheduleReminder() {
  if (!("Notification" in window)) {
    alert("当前浏览器不支持通知提醒。");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission !== "granted") {
      alert("你还没有允许通知。可以之后在浏览器设置里打开。");
      return;
    }
    state.reminderTime = els.reminderTime.value;
    saveState();
    alert(`已开启提醒：每天 ${state.reminderTime}。网站打开时会触发提醒。`);
  });
}

function reminderLoop() {
  const now = new Date();
  const current = now.toTimeString().slice(0, 5);
  const flag = `reminded-${todayKey()}`;
  if (current === state.reminderTime && Notification.permission === "granted" && !sessionStorage.getItem(flag)) {
    new Notification("韩语学习提醒", { body: "今天的韩语打卡还在等你。" });
    sessionStorage.setItem(flag, "1");
  }
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button, .tab-page").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("active");
  });
});

els.learnerName.addEventListener("input", () => {
  state.name = els.learnerName.value.trim();
  saveState();
  render();
});

els.dailyGoal.addEventListener("change", () => {
  state.dailyGoal = Number(els.dailyGoal.value);
  saveState();
  renderProgress();
});

els.planStartDate.addEventListener("change", () => {
  state.planStartDate = els.planStartDate.value || "2026-06-02";
  saveState();
  render();
});

els.jumpToday.addEventListener("click", () => {
  const target = document.querySelector(`#plan-${todayKey()}`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert("今天不在当前 180 天计划内，可以调整开始日期。");
  }
});

els.reminderTime.addEventListener("change", () => {
  state.reminderTime = els.reminderTime.value;
  saveState();
});

els.enableReminder.addEventListener("click", scheduleReminder);

els.saveMinutes.addEventListener("click", () => {
  const minutes = Math.max(0, Math.min(360, Number(els.minutesInput.value || 0)));
  state.minutes[todayKey()] = minutes;
  saveState();
  renderProgress();
});

els.resetToday.addEventListener("click", () => {
  state.tasks[todayKey()] = dailyTasks.map((text) => ({ text, done: false }));
  state.minutes[todayKey()] = 0;
  state.checkins = state.checkins.filter((day) => day !== todayKey());
  saveState();
  render();
});

els.checkIn.addEventListener("click", () => {
  const key = todayKey();
  if (!state.checkins.includes(key)) state.checkins.push(key);
  saveState();
  renderProgress();
});

els.playCurrent.addEventListener("click", () => speak(state.activeSound));

els.voiceSelect.addEventListener("change", () => speak(state.activeSound));

els.markMastered.addEventListener("click", () => {
  if (!state.mastered.includes(state.activeSound)) {
    state.mastered.push(state.activeSound);
    saveState();
    render();
  }
});

els.exportData.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `korean-study-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = users.find((item) => item.code === els.accessCode.value.trim());
  if (user) {
    sessionStorage.setItem(authKey, user.id);
    state = loadState();
    els.accessCode.value = "";
    els.loginMessage.textContent = `验证成功：${user.name}`;
    refreshAuth();
    render();
    return;
  }
  els.loginMessage.textContent = "访问码不正确，请重新输入。";
  els.accessCode.focus();
});

els.logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(authKey);
  state = loadState();
  refreshAuth();
});

setInterval(reminderLoop, 30000);
if ("speechSynthesis" in window) {
  populateVoices();
  window.speechSynthesis.onvoiceschanged = populateVoices;
}
refreshAuth();
render();
