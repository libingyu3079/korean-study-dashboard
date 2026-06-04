const authKey = "daily-joy-log-user";
const users = [
  { id: "learner-01", name: "学习者 1", code: "hangul2026" },
  { id: "learner-02", name: "学习者 2", code: "topik2026" },
  { id: "learner-03", name: "学习者 3", code: "korea2026" }
];
const storageKeyFor = (userId) => `daily-joy-log-v1-${userId || "guest"}`;
const pad = (value) => String(value).padStart(2, "0");
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const monthKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const defaultHabits = [
  { id: "reading", group: "joy", icon: "📖", title: "看书", accent: "#ff7a91" },
  { id: "drama", group: "joy", icon: "🎬", title: "看剧", accent: "#20bfa0" },
  { id: "writing", group: "joy", icon: "✍️", title: "写作", accent: "#4b7bec" },
  { id: "korean", group: "must", icon: "🇰🇷", title: "韩语学习", accent: "#ef4444" },
  { id: "english", group: "must", icon: "📰", title: "英文片段阅读", accent: "#f2b93b" },
  { id: "ai", group: "must", icon: "🤖", title: "AI 学习", accent: "#8b5cf6" },
  { id: "water", group: "must", icon: "💧", title: "喝水", accent: "#2aa7ff" }
];

const unlockLines = [
  { source: "灵感来自电影里的清晨镜头", text: "生活没有突然变好，但你按下快门的这一秒，已经把今天认真收进了口袋。" },
  { source: "灵感来自旅行纪录片", text: "人会被很小的重复带去很远的地方。今天这一格，就是路标。" },
  { source: "灵感来自深夜电台", text: "不用把每一天都过成代表作，愿意记录，就已经是在温柔地照顾自己。" },
  { source: "灵感来自成长小说", text: "主角不是一天长大的，是在很多个普通时刻里，悄悄选择不缺席。" },
  { source: "灵感来自城市漫游节目", text: "今天的风景也许很小，可你看见了它，它就有了名字。" },
  { source: "灵感来自舞台谢幕", text: "完成一次，就给自己一点掌声。观众不多也没关系，你在场就很好。" },
  { source: "灵感来自美食节目", text: "好习惯像慢火熬汤，今天这一点火候，明天会尝得出来。" },
  { source: "灵感来自体育转播", text: "不需要每天大胜，只要每天上场。今天这一次，是有效得分。" },
  { source: "灵感来自书店角落", text: "那些看似零碎的小事，会在某天排成队，告诉你：你真的走了很久。" },
  { source: "灵感来自周末综艺", text: "今日隐藏任务完成：把想做的事，变成已经做过的事。" }
];
const iconChoices = ["📖", "🎬", "✍️", "🇰🇷", "📰", "🤖", "💧", "🌙", "🏃", "🎧", "🎨", "🧘", "🍵", "☕", "🌿", "🔥", "⭐", "📝", "📷", "🍎", "🛏️", "🧠"];

const defaultState = {
  checkins: {},
  customHabits: [],
  lastUnlocked: null
};

let state = loadState();
let pendingHabitId = null;
let pendingPhotoHabitId = null;
let statsMonth = monthKey();

const els = {
  todayLabel: document.querySelector("#todayLabel"),
  joyList: document.querySelector("#joyList"),
  mustList: document.querySelector("#mustList"),
  todayDoneCount: document.querySelector("#todayDoneCount"),
  totalCheckins: document.querySelector("#totalCheckins"),
  streakCount: document.querySelector("#streakCount"),
  photoInput: document.querySelector("#photoInput"),
  unlockSheet: document.querySelector("#unlockSheet"),
  unlockPhoto: document.querySelector("#unlockPhoto"),
  unlockSource: document.querySelector("#unlockSource"),
  unlockTitle: document.querySelector("#unlockTitle"),
  unlockText: document.querySelector("#unlockText"),
  closeUnlock: document.querySelector("#closeUnlock"),
  attachPhoto: document.querySelector("#attachPhoto"),
  openStats: document.querySelector("#openStats"),
  statsScreen: document.querySelector("#statsScreen"),
  closeStats: document.querySelector("#closeStats"),
  statsTotalCount: document.querySelector("#statsTotalCount"),
  statsTotalDays: document.querySelector("#statsTotalDays"),
  currentMonthLabel: document.querySelector("#currentMonthLabel"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  statsList: document.querySelector("#statsList"),
  loginForm: document.querySelector("#loginForm"),
  accessCode: document.querySelector("#accessCode"),
  loginMessage: document.querySelector("#loginMessage"),
  logoutButton: document.querySelector("#logoutButton")
};

Object.assign(els, {
  openAddHabit: document.querySelector("#openAddHabit"),
  addHabitSheet: document.querySelector("#addHabitSheet"),
  addHabitForm: document.querySelector("#addHabitForm"),
  habitTitle: document.querySelector("#habitTitle"),
  habitGroup: document.querySelector("#habitGroup"),
  habitIcon: document.querySelector("#habitIcon"),
  iconChoices: document.querySelector("#iconChoices"),
  habitColor: document.querySelector("#habitColor"),
  cancelAddHabit: document.querySelector("#cancelAddHabit")
});

function getHabits() {
  return [...defaultHabits, ...(state.customHabits || [])];
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(storageKeyFor(sessionStorage.getItem(authKey)))) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKeyFor(sessionStorage.getItem(authKey)), JSON.stringify(state));
}

function refreshAuth() {
  const userId = sessionStorage.getItem(authKey);
  document.body.classList.toggle("locked", !users.some((user) => user.id === userId));
}

function getHabitEntries(habitId) {
  return state.checkins[habitId] || [];
}

function getTodayHabitEntry(habitId) {
  return getHabitEntries(habitId).find((entry) => entry.date === todayKey());
}

function randomUnlock(habitId) {
  const habit = getHabits().find((item) => item.id === habitId);
  const line = unlockLines[Math.floor(Math.random() * unlockLines.length)];
  return {
    source: line.source,
    title: `${habit.icon} ${habit.title} +1`,
    text: line.text
  };
}

function render() {
  const now = new Date();
  els.todayLabel.textContent = `${now.getMonth() + 1}月${now.getDate()}日 · ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()]}`;
  els.joyList.innerHTML = "";
  els.mustList.innerHTML = "";
  getHabits().forEach((habit) => {
    const card = renderHabitCard(habit);
    if (habit.group === "joy") els.joyList.appendChild(card);
    if (habit.group === "must") els.mustList.appendChild(card);
  });
  renderStats();
  renderIconChoices();
}

function renderHabitCard(habit) {
  const entries = getHabitEntries(habit.id);
  const todayEntry = getTodayHabitEntry(habit.id);
  const card = document.createElement("article");
  card.className = "habit-card";
  card.style.setProperty("--accent", habit.accent);
  card.innerHTML = `
    <div class="habit-main">
      <h3>${habit.icon} ${habit.title}</h3>
      <p>${todayEntry ? "今日已打卡" : "所有 · 次数"}</p>
      <div class="dot-row">${renderDots(entries)}</div>
    </div>
    <div class="habit-action">
      ${todayEntry?.photo ? `<img class="last-photo" src="${todayEntry.photo}" alt="${habit.title} 今日照片" />` : ""}
      <div class="count-badge">${entries.length}</div>
      <button class="camera-btn" type="button" aria-label="${habit.title} 打卡">＋</button>
    </div>
  `;
  card.querySelector(".camera-btn").addEventListener("click", () => {
    saveCheckin(habit.id);
  });
  return card;
}

function renderIconChoices() {
  els.iconChoices.innerHTML = "";
  iconChoices.forEach((icon) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-choice";
    if (els.habitIcon.value.trim() === icon) button.classList.add("active");
    button.textContent = icon;
    button.addEventListener("click", () => {
      els.habitIcon.value = icon;
      renderIconChoices();
    });
    els.iconChoices.appendChild(button);
  });
}

function renderDots(entries) {
  const filled = Math.min(entries.length, 24);
  const dots = Array.from({ length: 24 }, (_, index) => {
    const done = index < filled;
    return `<span class="dot ${done ? "done" : ""}"></span>`;
  });
  return dots.join("");
}

function renderStats() {
  const today = todayKey();
  const allEntries = Object.values(state.checkins).flat();
  els.todayDoneCount.textContent = allEntries.filter((entry) => entry.date === today).length;
  els.totalCheckins.textContent = allEntries.length;
  els.streakCount.textContent = getStreak();
}

function getStreak() {
  const days = new Set(Object.values(state.checkins).flat().map((entry) => entry.date));
  let count = 0;
  const date = new Date();
  while (days.has(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`)) {
    count += 1;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

function renderStatsScreen() {
  const allEntries = Object.values(state.checkins).flat();
  const allDays = new Set(allEntries.map((entry) => entry.date));
  els.statsTotalCount.textContent = allEntries.length;
  els.statsTotalDays.textContent = allDays.size;
  els.currentMonthLabel.textContent = statsMonth;
  els.statsList.innerHTML = "";
  getHabits().forEach((habit) => {
    const entries = getHabitEntries(habit.id).filter((entry) => entry.date.startsWith(statsMonth));
    const days = new Set(entries.map((entry) => Number(entry.date.slice(8, 10))));
    const card = document.createElement("article");
    card.className = "stats-card";
    card.style.setProperty("--accent", habit.accent);
    card.innerHTML = `
      <div>
        <h2>${habit.icon} ${habit.title}</h2>
        <div class="stats-numbers">
          <span>X${entries.length}</span>
          <span>${days.size}天</span>
          <span>${getMonthPercent(days.size)}%</span>
        </div>
      </div>
      <div class="month-grid">${renderMonthCells(days)}</div>
    `;
    els.statsList.appendChild(card);
  });
}

function getDaysInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

function getMonthPercent(doneDays) {
  return Math.round((doneDays / getDaysInMonth(statsMonth)) * 100);
}

function renderMonthCells(days) {
  const total = getDaysInMonth(statsMonth);
  return Array.from({ length: total }, (_, index) => {
    const day = index + 1;
    return `<span class="day-cell ${days.has(day) ? "done" : ""}">${day}</span>`;
  }).join("");
}

function shiftMonth(delta) {
  const [year, month] = statsMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  statsMonth = monthKey(date);
  renderStatsScreen();
}

function saveCheckin(habitId, photo = "") {
  const habit = getHabits().find((item) => item.id === habitId);
  if (!habit) return;
  const unlocked = randomUnlock(habit.id);
  const entry = {
    date: todayKey(),
    time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    photo,
    unlocked
  };
  const entries = getHabitEntries(habit.id).filter((item) => item.date !== todayKey());
  state.checkins[habit.id] = [...entries, entry];
  state.lastUnlocked = { habitId: habit.id, ...entry };
  saveState();
  render();
  showUnlock(entry, habit);
}

function attachPhotoToToday(habitId, photo) {
  const habit = getHabits().find((item) => item.id === habitId);
  const entries = getHabitEntries(habitId);
  const entry = entries.find((item) => item.date === todayKey());
  if (!habit || !entry) return;
  entry.photo = photo;
  state.lastUnlocked = { habitId, ...entry };
  saveState();
  render();
  showUnlock(entry, habit);
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", reject);
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("error", reject);
      image.addEventListener("load", () => {
        const maxSize = 1000;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function showUnlock(entry, habit) {
  els.unlockPhoto.innerHTML = entry.photo
    ? `<img src="${entry.photo}" alt="${habit.title} 打卡照片" />`
    : `<span>今天没有照片，也算认真留下了一次。</span>`;
  els.unlockSource.textContent = entry.unlocked.source;
  els.unlockTitle.textContent = entry.unlocked.title;
  els.unlockText.textContent = entry.unlocked.text;
  els.unlockSheet.hidden = false;
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".section-block").forEach((section) => {
      section.classList.toggle("hidden", button.dataset.filter !== "all" && section.dataset.section !== button.dataset.filter);
    });
  });
});

els.photoInput.addEventListener("change", () => {
  const file = els.photoInput.files?.[0];
  if (!file || !pendingPhotoHabitId) return;
  resizeImageFile(file).then((photo) => attachPhotoToToday(pendingPhotoHabitId, photo)).catch(() => {
    alert("照片读取失败，请重新选择一张。");
  });
});

els.closeUnlock.addEventListener("click", () => {
  els.unlockSheet.hidden = true;
});

els.openStats.addEventListener("click", () => {
  statsMonth = monthKey();
  renderStatsScreen();
  els.statsScreen.hidden = false;
});

els.closeStats.addEventListener("click", () => {
  els.statsScreen.hidden = true;
});

els.prevMonth.addEventListener("click", () => shiftMonth(-1));

els.nextMonth.addEventListener("click", () => shiftMonth(1));

els.attachPhoto.addEventListener("click", () => {
  pendingPhotoHabitId = state.lastUnlocked?.habitId || null;
  if (!pendingPhotoHabitId) return;
  els.photoInput.value = "";
  els.photoInput.click();
});

els.openAddHabit.addEventListener("click", () => {
  els.addHabitSheet.hidden = false;
  els.habitTitle.focus();
});

els.cancelAddHabit.addEventListener("click", () => {
  els.addHabitSheet.hidden = true;
  els.addHabitForm.reset();
  els.habitColor.value = "#20bfa0";
});

document.querySelector("[data-close-sheet='add']").addEventListener("click", () => {
  els.addHabitSheet.hidden = true;
});

els.addHabitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = els.habitTitle.value.trim();
  if (!title) return;
  const customHabit = {
    id: `custom-${Date.now()}`,
    group: els.habitGroup.value,
    icon: els.habitIcon.value.trim() || "✨",
    title,
    accent: els.habitColor.value
  };
  state.customHabits = [...(state.customHabits || []), customHabit];
  saveState();
  els.addHabitSheet.hidden = true;
  els.addHabitForm.reset();
  els.habitColor.value = "#20bfa0";
  render();
  if (!els.statsScreen.hidden) renderStatsScreen();
});

els.habitIcon.addEventListener("input", renderIconChoices);

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = users.find((item) => item.code === els.accessCode.value.trim());
  if (!user) {
    els.loginMessage.textContent = "访问码不正确，请重新输入。";
    els.accessCode.focus();
    return;
  }
  sessionStorage.setItem(authKey, user.id);
  state = loadState();
  els.accessCode.value = "";
  els.loginMessage.textContent = `验证成功：${user.name}`;
  refreshAuth();
  render();
});

els.logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(authKey);
  state = loadState();
  refreshAuth();
});

refreshAuth();
render();
