"use strict";

let habits = [];
const HABITS_KEY = "HABITS_KEY";
let globalActiveId;

// page
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    dayContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbit__day"),
  },
  popup: {
    content: document.getElementById("add-habbit-popup"),
    iconValue: document.querySelector('.popup__form input[name="icon"]'),
  },
};

// utils
function loadData() {
  const data = localStorage.getItem(HABITS_KEY);
  const dataParsed = JSON.parse(data);
  if (Array.isArray(dataParsed)) {
    habits = dataParsed;
  }
}

function saveData() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function setIcon(context, icon) {
  page.popup.iconValue.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  activeIcon.classList.remove("icon_active");
  context.classList.add("icon_active");
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return false;
  }
  return res;
}

// events
function togglePopup() {
  if (page.popup.content.classList.contains("cover_hidden")) {
    page.popup.content.classList.remove("cover_hidden");
  } else {
    page.popup.content.classList.add("cover_hidden");
  }
}

function addDays(event) {
  event.preventDefault();

  const data = validateForm(event.target, ["comment"]);
  if (!data) return;
  habits.map((habit) => {
    if (habit.id === globalActiveId) {
      return {
        ...habit,
        days: habit.days.push({ comment: data.comment }),
      };
    }

    return habit;
  });
  resetForm(event.target, ["comment"]);
  render(globalActiveId);
  saveData();
}

function deleteDay(index) {
  habits.find((habit) => habit.id === globalActiveId).days.splice(index, 1);
  render(globalActiveId);
  saveData();
}

function addHabit(event) {
  event.preventDefault();
  const data = validateForm(event.target, ["name", "icon", "target"]);
  if (!data) return;
  const maxId = habits.reduce((acc, habit) => acc > habit.id ? acc : habit.id, 0);
  habits.push({
    id: maxId + 1,
    name: data.name,
    icon: data.icon,
    target: data.target,
    days: [],
  })
  resetForm(event.target, ["name", "target"]);
  togglePopup();
  render(maxId + 1);
  saveData();
}

// render
function renderMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habit-id", habit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => render(habit.id));
      element.innerHTML = `<img src="./images/${habit.icon}.svg" width="24" height="24"  alt="${habit.name}">`;
      if (activeHabit.id === habit.id) {
        element.classList.add("menu__item_active");
      }

      page.menu.appendChild(element);

      continue;
    }

    if (activeHabit.id === habit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function renderHead(activeHabit) {
  page.header.h1.innerText = activeHabit.name;
  const progress =
    activeHabit.days.length / activeHabit.target > 1
      ? 100
      : (activeHabit.days.length / activeHabit.target) * 100;
  page.header.progressCoverBar.style.width = `${progress}%`;
  page.header.progressPercent.innerText = `${progress}%`;
}

function renderContent(activeHabit) {
  page.content.dayContainer.innerHTML = "";
  for (const index in activeHabit.days) {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = `
			<div class="habbit__day">День ${Number(index) + 1}</div>
			<div class="habbit__comment">${activeHabit.days[index].comment}</div>
			<button class="habbit__delete" onclick="deleteDay(${index})"><img src="./images/delete.svg" alt="Удалить день ${
      Number(index) + 1
    }" /></button>
		`;

    page.content.dayContainer.appendChild(element);
  }

  page.content.nextDay.innerText = `День ${activeHabit.days.length + 1}`;
}

function render(activeHabitId) {
  globalActiveId = activeHabitId;
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);
  if (!activeHabit) return;
  document.location.replace(document.location.pathname + `#${activeHabitId}`);
  renderMenu(activeHabit);
  renderHead(activeHabit);
  renderContent(activeHabit);
}

// init
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace("#", ""));
  const urlHabits = habits.find((habit) => habit.id === hashId);
  if(urlHabits) {
    render(urlHabits.id);
  } else {
    render(habits[0].id);
  }
  
})();
