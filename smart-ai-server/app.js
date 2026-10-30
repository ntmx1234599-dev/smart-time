
// ==========================================
// SMART TIME - CHƯƠNG TRÌNH CHÍNH
// ==========================================

// ------------------------------------------
// 1. CHỨC NĂNG LẬP KẾ HOẠCH HỌC TẬP
// ------------------------------------------

const STORAGE_KEY = "smart_time_tasks";

let tasks = [];

try {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  if (!Array.isArray(tasks)) tasks = [];
} catch (error) {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.hidden = true;
  });

  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    selectedPage.hidden = false;
  }

  if (pageId === "achievementPage") {
    renderAchievementPage();
  }
}

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-card";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const info = document.createElement("p");
    info.textContent =
      "Môn học: " + (task.subject || "Chưa chọn") +
      " | Ngày: " + (task.date || "Chưa chọn") +
      " | Ưu tiên: " + (task.priority || "Bình thường");

    const status = document.createElement("p");
    status.textContent = task.completed
      ? "✅ Đã hoàn thành"
      : "⏳ Chưa hoàn thành";

    const completeButton = document.createElement("button");
    completeButton.textContent = task.completed
      ? "Đánh dấu chưa xong"
      : "Hoàn thành";

    completeButton.addEventListener("click", () => {
      task.completed = !task.completed;

      if (task.completed) {
        awardTaskPoints(task.id);
      }

      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Xóa nhiệm vụ";

    deleteButton.addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn xóa nhiệm vụ này không?")) {
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks();
        renderTasks();
      }
    });

    item.appendChild(title);
    item.appendChild(info);
    item.appendChild(status);
    item.appendChild(completeButton);
    item.appendChild(deleteButton);

    taskList.appendChild(item);
  });

  const total = tasks.length;
  const done = tasks.filter(task => task.completed).length;

  const taskTotal = document.getElementById("taskTotal");
  const totalCount = document.getElementById("totalCount");
  const doneCount = document.getElementById("doneCount");

  if (taskTotal) taskTotal.textContent = total;
  if (totalCount) totalCount.textContent = total;
  if (doneCount) doneCount.textContent = done;
}

if (taskForm) {
  taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("taskTitle");
    const subject = document.getElementById("taskSubject");
    const date = document.getElementById("taskDate");
    const priority = document.getElementById("taskPriority");

    if (!title || !title.value.trim()) {
      alert("Bạn hãy nhập tên nhiệm vụ nhé!");
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title.value.trim(),
      subject: subject ? subject.value : "",
      date: date ? date.value : "",
      priority: priority ? priority.value : "",
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();

    alert("Đã thêm nhiệm vụ học tập!");
  });
}

renderTasks();


// ------------------------------------------
// 2. CHỨC NĂNG ĐỒNG HỒ TẬP TRUNG
// ------------------------------------------

const durationSelect = document.getElementById("focusDuration");
const timerDisplay = document.getElementById("timerDisplay");
const timerMessage = document.getElementById("timerMessage");
const screenReminder = document.getElementById("screenReminder");
const startButton = document.getElementById("startTimer");
const pauseButton = document.getElementById("pauseTimer");
const resetButton = document.getElementById("resetTimer");

let selectedMinutes = durationSelect
  ? Number(durationSelect.value)
  : 25;

let remainingSeconds = selectedMinutes * 60;
let timerInterval = null;
let isRunning = false;

function updateTimerDisplay() {
  if (!timerDisplay) return;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
}

function startTimerFunction() {
  if (isRunning) return;

  if (remainingSeconds <= 0) {
    remainingSeconds = selectedMinutes * 60;
  }

  isRunning = true;
  if (screenReminder) {
  screenReminder.hidden = true;
}
  if (timerMessage) {
    timerMessage.textContent =
      "🌱 Hãy tập trung vào nhiệm vụ của bạn!";
  }

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    remainingSeconds--;

    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();

      awardFocusPoints();

      if (timerMessage) {
        timerMessage.textContent =
          "🎉 Bạn đã hoàn thành phiên học!";
      }
      if (screenReminder) {
  screenReminder.hidden = false;
  screenReminder.textContent =
    "🎉 Tuyệt vời! Bạn đã hoàn thành phiên học. Hãy nghỉ ngơi một chút nhé!";
}

      alert(
        "Chúc mừng bạn! 🎉\n" +
        "Bạn đã hoàn thành " +
        selectedMinutes +
        " phút tập trung học tập."
      );
    }
  }, 1000);
}

if (durationSelect) {
  durationSelect.addEventListener("change", () => {
    stopTimer();

    selectedMinutes = Number(durationSelect.value);
    remainingSeconds = selectedMinutes * 60;

    updateTimerDisplay();

    if (timerMessage) {
      timerMessage.textContent =
        "Bạn đã sẵn sàng bắt đầu chưa?";
    }
  });
}

if (startButton) {
  startButton.addEventListener("click", startTimerFunction);
}

if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    if (!isRunning) return;

    stopTimer();

    if (timerMessage) {
      timerMessage.textContent =
        "Đồng hồ đã tạm dừng. Bạn có thể tiếp tục khi sẵn sàng.";
    }
  });
}

if (resetButton) {
  resetButton.addEventListener("click", () => {
    stopTimer();

    remainingSeconds = selectedMinutes * 60;

    updateTimerDisplay();

    if (timerMessage) {
      timerMessage.textContent =
        "Đồng hồ đã được đặt lại. Bạn có thể bắt đầu!";
    }
  });
}

updateTimerDisplay();


// ------------------------------------------
// 3. ĐĂNG KÝ CHẾ ĐỘ SỬ DỤNG NGOẠI TUYẾN
// ------------------------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => {
        console.log("SMART TIME đã sẵn sàng!");
      })
      .catch(error => {
        console.log("Chưa đăng ký được Service Worker:", error);
      });
  });
}


// ==========================================
// 4. NHẬT KÝ SỬ DỤNG ĐIỆN THOẠI
// ==========================================

const PHONE_STORAGE_KEY = "smart_time_phone_records";

let phoneRecords = [];

try {
  phoneRecords =
    JSON.parse(localStorage.getItem(PHONE_STORAGE_KEY)) || [];

  if (!Array.isArray(phoneRecords)) phoneRecords = [];
} catch (error) {
  phoneRecords = [];
}

const phoneForm = document.getElementById("phoneForm");
const phoneDate = document.getElementById("phoneDate");
const studyHours = document.getElementById("studyHours");
const studyMinutes = document.getElementById("studyMinutes");
const playHours = document.getElementById("playHours");
const playMinutes = document.getElementById("playMinutes");

const studyTotal = document.getElementById("studyTotal");
const playTotal = document.getElementById("playTotal");
const phoneAdvice = document.getElementById("phoneAdvice");
const phoneHistory = document.getElementById("phoneHistory");

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function savePhoneRecords() {
  localStorage.setItem(
    PHONE_STORAGE_KEY,
    JSON.stringify(phoneRecords)
  );
}

function formatPhoneTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;

  return `${hours} giờ ${minutes} phút`;
}

function renderPhoneRecords() {
  if (
    !studyTotal ||
    !playTotal ||
    !phoneHistory ||
    !phoneAdvice
  ) return;

  const lastSevenDays = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    lastSevenDays.push(`${year}-${month}-${day}`);
  }

  const recentRecords = phoneRecords.filter(record =>
    lastSevenDays.includes(record.date)
  );

  const totalStudy = recentRecords.reduce(
    (sum, record) => sum + record.study, 0
  );

  const totalPlay = recentRecords.reduce(
    (sum, record) => sum + record.play, 0
  );

  studyTotal.textContent = formatPhoneTime(totalStudy);
  playTotal.textContent = formatPhoneTime(totalPlay);

  if (recentRecords.length === 0) {
    phoneHistory.textContent = "Chưa có dữ liệu theo dõi.";
  } else {
    phoneHistory.innerHTML = "";

    recentRecords
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(record => {
        const item = document.createElement("div");
        item.className = "phone-history-item";

        const dateText = document.createElement("strong");
        dateText.textContent = record.date;

        const studyText = document.createElement("p");
        studyText.textContent =
          "📚 Học tập: " + formatPhoneTime(record.study);

        const playText = document.createElement("p");
        playText.textContent =
          "🎮 Giải trí: " + formatPhoneTime(record.play);

        const editButton = document.createElement("button");
        editButton.textContent = "✏️ Sửa";

        editButton.addEventListener("click", () => {
          if (!phoneForm) return;

          phoneDate.value = record.date;
          studyHours.value = Math.floor(record.study / 60);
          studyMinutes.value = record.study % 60;
          playHours.value = Math.floor(record.play / 60);
          playMinutes.value = record.play % 60;

          phoneForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Xóa";

        deleteButton.addEventListener("click", () => {
          if (confirm("Bạn có chắc muốn xóa nhật ký ngày này không?")) {
            phoneRecords = phoneRecords.filter(
              r => r.date !== record.date
            );

            savePhoneRecords();
            renderPhoneRecords();
          }
        });

        item.appendChild(dateText);
        item.appendChild(studyText);
        item.appendChild(playText);
        item.appendChild(editButton);
        item.appendChild(deleteButton);

        phoneHistory.appendChild(item);
      });
  }

  if (totalStudy + totalPlay === 0) {
    phoneAdvice.textContent =
      "🌱 Hãy bắt đầu theo dõi để hiểu rõ hơn thói quen sử dụng điện thoại nhé!";
  } else if (totalPlay > totalStudy) {
    phoneAdvice.textContent =
      "💡 Thời gian giải trí đang nhiều hơn thời gian học tập. " +
      "Bạn hãy thử sắp xếp lại thời gian để cân bằng hơn nhé!";
  } else {
    phoneAdvice.textContent =
      "🌟 Bạn đang có sự cân bằng khá tốt giữa học tập và giải trí. " +
      "Hãy tiếp tục duy trì thói quen tích cực nhé!";
  }
}

if (phoneForm) {
  if (phoneDate) {
    phoneDate.value = getTodayString();
  }

  phoneForm.addEventListener("submit", event => {
    event.preventDefault();

    const date = phoneDate.value;

    const sh = Number(studyHours.value);
    const sm = Number(studyMinutes.value);
    const ph = Number(playHours.value);
    const pm = Number(playMinutes.value);

    if (!date) {
      alert("Bạn hãy chọn ngày ghi nhận nhé!");
      return;
    }

    const values = [sh, sm, ph, pm];

    if (
      values.some(value =>
        !Number.isInteger(value) || value < 0
      ) ||
      sh > 24 || ph > 24 ||
      sm > 59 || pm > 59
    ) {
      alert("Cô hãy nhập số giờ từ 0 đến 24 và số phút từ 0 đến 59 nhé!");
      return;
    }

    const study = sh * 60 + sm;
    const play = ph * 60 + pm;

    if (study + play > 1440) {
      alert("Tổng thời gian học tập và giải trí không thể vượt quá 24 giờ!");
      return;
    }

    const existingIndex = phoneRecords.findIndex(
      record => record.date === date
    );

    const newRecord = {
      date: date,
      study: study,
      play: play
    };

    if (existingIndex >= 0) {
      phoneRecords[existingIndex] = newRecord;
    } else {
      phoneRecords.push(newRecord);
    }

    savePhoneRecords();
    renderPhoneRecords();

    alert("🎉 Nhật ký sử dụng điện thoại đã được lưu!");

    studyHours.value = 0;
    studyMinutes.value = 0;
    playHours.value = 0;
    playMinutes.value = 0;
    phoneDate.value = getTodayString();
  });
}

renderPhoneRecords();


// ==========================================
// 5. BIỂU ĐỒ THEO DÕI 7 NGÀY
// ==========================================

function renderPhoneChart() {
  const chart = document.getElementById("phoneChart");

  if (!chart) return;

  chart.innerHTML = "";

  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    const record = phoneRecords.find(
      item => item.date === dateString
    );

    days.push({
      date: dateString,
      label: `${day}/${month}`,
      study: record ? record.study : 0,
      play: record ? record.play : 0
    });
  }

  const maxValue = Math.max(
    1,
    ...days.map(day => Math.max(day.study, day.play))
  );

  days.forEach(day => {
    const dayColumn = document.createElement("div");
    dayColumn.className = "chart-day";

    const bars = document.createElement("div");
    bars.className = "chart-bars";

    const studyBar = document.createElement("div");
    studyBar.className = "chart-bar chart-study-bar";

    const studyHeight = day.study === 0
      ? 3
      : Math.max(3, day.study / maxValue * 100);

    studyBar.style.height = studyHeight + "%";
    studyBar.title = "Học tập: " + formatPhoneTime(day.study);

    const playBar = document.createElement("div");
    playBar.className = "chart-bar chart-play-bar";

    const playHeight = day.play === 0
      ? 3
      : Math.max(3, day.play / maxValue * 100);

    playBar.style.height = playHeight + "%";
    playBar.title = "Giải trí: " + formatPhoneTime(day.play);

    bars.appendChild(studyBar);
    bars.appendChild(playBar);

    const values = document.createElement("div");
    values.className = "chart-values";
    values.textContent =
      day.study + " / " + day.play + " phút";

    const label = document.createElement("div");
    label.className = "chart-day-label";
    label.textContent = day.label;

    dayColumn.appendChild(bars);
    dayColumn.appendChild(values);
    dayColumn.appendChild(label);

    chart.appendChild(dayColumn);
  });
}

const oldRenderPhoneRecords = renderPhoneRecords;

renderPhoneRecords = function () {
  oldRenderPhoneRecords();
  renderPhoneChart();
};

renderPhoneRecords();


// ==========================================
// 6. THÀNH TÍCH VÀ ĐIỂM THƯỞNG SMART TIME
// ==========================================

function getSmartTimeAchievementData() {
  const saved = localStorage.getItem("smart_time_achievement_data");

  if (saved) {
    try {
      const data = JSON.parse(saved);

      return {
        points: Number(data.points) || 0,
        rewardedTasks: Array.isArray(data.rewardedTasks)
          ? data.rewardedTasks
          : [],
        focusSessions: Number(data.focusSessions) || 0
      };
    } catch (error) {
      console.log("Không đọc được dữ liệu thành tích.");
    }
  }

  return {
    points: 0,
    rewardedTasks: [],
    focusSessions: 0
  };
}

function saveSmartTimeAchievementData(data) {
  localStorage.setItem(
    "smart_time_achievement_data",
    JSON.stringify(data)
  );
}

// Lấy số liệu trước khi cộng điểm
function getPreviousAchievementData(data) {
  return {
    points: data.points,
    rewardedTasks: data.rewardedTasks.length,
    focusSessions: data.focusSessions
  };
}

// Thông báo khi mở khóa huy hiệu mới
function showNewBadgeMessage(previous, current) {
  const newBadges = [];

  if (
    previous.rewardedTasks < 1 &&
    current.rewardedTasks.length >= 1
  ) {
    newBadges.push("🌱 Khởi đầu tốt");
  }

  if (
    previous.rewardedTasks < 5 &&
    current.rewardedTasks.length >= 5
  ) {
    newBadges.push("📚 Chăm học");
  }

  if (
    previous.focusSessions < 5 &&
    current.focusSessions >= 5
  ) {
    newBadges.push("⏱️ Tập trung");
  }

  if (
    previous.points < 100 &&
    current.points >= 100
  ) {
    newBadges.push("🏆 Kiên trì");
  }

  if (newBadges.length > 0) {
    alert(
      "🎉 CHÚC MỪNG BẠN!\n\n" +
      "Bạn vừa mở khóa huy hiệu:\n" +
      newBadges.join("\n") +
      "\n\nHãy tiếp tục cố gắng nhé!"
    );
  }
}

// Cộng 10 điểm khi hoàn thành một nhiệm vụ lần đầu
function awardTaskPoints(taskId) {
  const data = getSmartTimeAchievementData();

  const id = String(taskId);

  if (data.rewardedTasks.includes(id)) return;

  const previous = getPreviousAchievementData(data);

  data.points += 10;
  data.rewardedTasks.push(id);

  saveSmartTimeAchievementData(data);

  showNewBadgeMessage(previous, data);
  renderAchievementPage();
}

// Cộng 5 điểm khi hoàn thành một phiên tập trung
function awardFocusPoints() {
  const data = getSmartTimeAchievementData();

  const previous = getPreviousAchievementData(data);

  data.points += 5;
  data.focusSessions += 1;

  saveSmartTimeAchievementData(data);

  showNewBadgeMessage(previous, data);
  renderAchievementPage();
}

// Hiển thị điểm và huy hiệu
function renderAchievementPage() {
  const data = getSmartTimeAchievementData();

  const totalPoints = document.getElementById("totalPoints");
  const message = document.getElementById("achievementMessage");

 
  // CẬP NHẬT CẤP ĐỘ HỌC SINH
  const studentLevel = document.getElementById("studentLevel");
  const levelDescription = document.getElementById("levelDescription");
  const levelProgress = document.getElementById("levelProgress");
  const progressText = document.getElementById("progressText");

  let levelName = "🌱 Mầm non";
  let description = "Hãy bắt đầu hành trình cố gắng nhé!";
  let currentPoints = data.points;
  let nextTarget = 20;
  let previousTarget = 0;

  if (currentPoints >= 100) {
    levelName = "🏆 Siêu sao";
    description = "Tuyệt vời! Em đã trở thành Siêu sao SMART TIME!";
    previousTarget = 100;
    nextTarget = 100;
  } else if (currentPoints >= 60) {
    levelName = "⭐ Tiến bộ";
    description = "Em đang ngày càng tiến bộ!";
    previousTarget = 60;
    nextTarget = 100;
  } else if (currentPoints >= 20) {
    levelName = "📚 Chăm chỉ";
    description = "Em đã có những cố gắng rất đáng khen!";
    previousTarget = 20;
    nextTarget = 60;
  }

  const progress = nextTarget === previousTarget
    ? 100
    : Math.min(
        100,
        ((currentPoints - previousTarget) /
          (nextTarget - previousTarget)) * 100
      );

  if (studentLevel) {
    studentLevel.textContent = levelName;
  }

  if (levelDescription) {
    levelDescription.textContent = description;
  }

  if (levelProgress) {
    levelProgress.style.width = progress + "%";
  }

  if (progressText) {
    progressText.textContent = nextTarget === previousTarget
      ? currentPoints + " điểm – Đã đạt cấp cao nhất!"
      : currentPoints + " / " + nextTarget + " điểm";
  }

  if (totalPoints) {
    totalPoints.textContent = data.points;
  }

  if (message) {
    message.textContent = data.points >= 100
      ? "🏆 Tuyệt vời! Em đã tích lũy được 100 điểm. Hãy tiếp tục phát huy nhé!"
      : "Mỗi nhiệm vụ hoàn thành là một bước tiến. Cố gắng thêm mỗi ngày nhé!";
  }

  const badges = document.querySelectorAll(".badge-item");

  const unlocked = [
    data.rewardedTasks.length >= 1,
    data.rewardedTasks.length >= 5,
    data.focusSessions >= 5,
    data.points >= 100
  ];

  badges.forEach((badge, index) => {
    badge.classList.toggle("unlocked", !!unlocked[index]);

    const note = badge.querySelector("small");

    if (note) {
      note.textContent = unlocked[index]
        ? "🔓 Đã mở khóa"
        : "🔒 Chưa mở khóa";
    }
  });
}

// Cập nhật thành tích khi mở ứng dụng
renderAchievementPage();

console.log("SMART TIME đã tải đầy đủ chức năng!");
// ==========================================
// 7. TRỢ LÝ SMART AI - TRÒ CHUYỆN HỌC TẬP
// ==========================================

const aiChatForm = document.getElementById("aiChatForm");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");
const aiSendButton = document.getElementById("aiSendButton");

// Địa chỉ máy chủ SMART AI khi chạy thử trên máy tính
const SMART_AI_URL = "http://localhost:3000/api/chat";

// Lưu lịch sử trò chuyện trong phiên hiện tại
let aiHistory = [];

function addAIMessage(role, content) {
  const message = document.createElement("div");

  message.className = role === "user"
    ? "user-message"
    : "ai-message";

  const heading = document.createElement("strong");
  heading.textContent = role === "user"
    ? "👩‍🎓 Em"
    : "🤖 SMART AI";

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  message.appendChild(heading);
  message.appendChild(paragraph);

  aiMessages.appendChild(message);

  aiMessages.scrollTop = aiMessages.scrollHeight;
}

if (aiChatForm) {
  aiChatForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = aiInput.value.trim();

    if (!message) {
      alert("Em hãy nhập câu hỏi nhé!");
      return;
    }

    if (aiSendButton) {
      aiSendButton.disabled = true;
      aiSendButton.textContent = "⏳ Đang trả lời...";
    }

    addAIMessage("user", message);

    aiInput.value = "";

    try {
      const response = await fetch(SMART_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message,
          history: aiHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể kết nối SMART AI.");
      }

      const reply = data.reply || "SMART AI chưa có câu trả lời.";

      addAIMessage("assistant", reply);

      aiHistory.push(
        { role: "user", content: message },
        { role: "assistant", content: reply }
      );

      aiHistory = aiHistory.slice(-10);

    } catch (error) {
      console.error("Lỗi SMART AI:", error);

      addAIMessage(
        "assistant",
        "Xin lỗi em! SMART AI đang gặp sự cố kết nối. Em hãy thử lại nhé!"
      );

    } finally {
      if (aiSendButton) {
        aiSendButton.disabled = false;
        aiSendButton.textContent = "➤ Gửi tin nhắn";
      }
    }
  });
}