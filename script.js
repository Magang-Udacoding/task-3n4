// ambil elemen html
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const filtersContainer = document.getElementById("filters");
const itemsLeft = document.getElementById("items-left");

// variabel untuk menyimpan data todos
let todos = [];

// variabel untuk track filter yang aktif
let currentFilter = "all";


// fungsi tambah todo
function addTodo(text) {
  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    date: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).split("/").join("")
  };

  todos.push(todo);
  saveTodos();
  renderTodos();
}

// add event listener submit pada form
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = input.value.trim();
  if (text === "") return;

  addTodo(text);
  input.value = "";
  input.focus();
});


// render todos
function renderTodos() {
  todoList.innerHTML = "";

  let filtered = todos;

  if (currentFilter === "active") {
    filtered = todos.filter(function (t) { return !t.completed; });
  } else if (currentFilter === "completed") {
    filtered = todos.filter(function (t) { return t.completed; });
  }

  filtered.forEach(function (todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.setAttribute("draggable", "true");
    li.setAttribute("data-id", todo.id);

    li.innerHTML = `
      <span class="todo-check"></span>
      <span class="todo-text">${todo.text}</span>
      <span class="todo-date">${todo.date}</span>
      <button class="todo-delete">&times;</button>
    `;

    todoList.appendChild(li);
  });

  if (filtered.length === 0) {
    emptyState.classList.add("show");
  } else {
    emptyState.classList.remove("show");
  }

  updateCount();
}

function updateCount() {
  const activeCount = todos.filter(function (t) { return !t.completed; }).length;
  itemsLeft.textContent = activeCount + " items left";
}


// toggle selesai belum selesai
// pakai event delegation karena todo item dibuat dinamis oleh js
todoList.addEventListener("click", function (e) {
  const li = e.target.closest(".todo-item");
  if (!li) return;

  const id = Number(li.getAttribute("data-id"));

  if (e.target.classList.contains("todo-check")) {
    toggleTodo(id);
  }

  if (e.target.classList.contains("todo-delete")) {
    deleteTodo(id);
  }
});

function toggleTodo(id) {
  todos = todos.map(function (t) {
    if (t.id === id) {
      return { ...t, completed: !t.completed };
    }
    return t;
  });

  saveTodos();
  renderTodos();
}


// hapus todo
function deleteTodo(id) {
  todos = todos.filter(function (t) { return t.id !== id; });
  saveTodos();
  renderTodos();
}


// edit todo double click
todoList.addEventListener("dblclick", function (e) {
  if (!e.target.classList.contains("todo-text")) return;

  const li = e.target.closest(".todo-item");
  const id = Number(li.getAttribute("data-id"));
  const todo = todos.find(function (t) { return t.id === id; });
  if (!todo) return;

  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.className = "todo-input-edit";
  inputEdit.value = todo.text;

  e.target.style.display = "none";
  li.insertBefore(inputEdit, e.target.nextSibling);
  inputEdit.focus();
  inputEdit.select();

  function saveEdit() {
    const newText = inputEdit.value.trim();
    if (newText !== "") {
      todo.text = newText;
      saveTodos();
    }
    renderTodos();
  }

  inputEdit.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") saveEdit();
  });
  inputEdit.addEventListener("blur", saveEdit);
  inputEdit.addEventListener("mousedown", function (ev) { ev.stopPropagation(); });
});


// filter todos
filtersContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("btn-filter")) return;

  document.querySelectorAll(".btn-filter").forEach(function (btn) {
    btn.classList.remove("active");
  });
  e.target.classList.add("active");

  currentFilter = e.target.getAttribute("data-filter");
  renderTodos();
});

// local storage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const data = localStorage.getItem("todos");
  if (data) {
    todos = JSON.parse(data);
  }
}

// muat data saat halaman pertama kali dibuka
loadTodos();
renderTodos();


// task 4 weather api
// ambil elemen html weather
const inputCity = document.getElementById("input-city");
const btnSearch = document.getElementById("btn-search");
const weatherDisplay = document.getElementById("weather-display");

// api key openweathermap
const apiKey = '28abfb50961d28dec26de428d3548a1c';

// handle input search
function handleSearch() {
  const city = inputCity.value.trim();
  if (city === "") return;
  getWeather(city);
}

// fetch data cuaca dari openweathermap
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  weatherDisplay.innerHTML = `<p class="weather-loading">Mencari data cuaca...</p>`;
  btnSearch.disabled = true;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Kota tidak ditemukan");
    }

    displayWeather(data);

  } catch (error) {
    weatherDisplay.innerHTML = `<p class="weather-error">❌ ${error.message}</p>`;
  } finally {
    btnSearch.disabled = false;
  }
}

// tentukan ikon lokal berdasarkan weather id
function getLocalIcon(weatherId) {
  if (weatherId === 800) return "weather icon/1.png";                    // clear sky
  if (weatherId >= 801 && weatherId <= 802) return "weather icon/2.png"; // few scattered clouds
  if (weatherId >= 803 && weatherId <= 804) return "weather icon/3.png"; // broken overcast clouds
  return "weather icon/4.png";                                            // hujan petir dll
}

// tampilkan data cuaca ke dom
function displayWeather(data) {
  const city = data.name;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const description = data.weather[0].description;
  const weatherId = data.weather[0].id;
  const windSpeed = data.wind.speed;
  const iconUrl = getLocalIcon(weatherId);

  weatherDisplay.innerHTML = `
    <div class="weather-card">
      <img class="weather-icon" src="${iconUrl}" alt="${description}" />
      <div class="weather-main">
        <div class="weather-city">${city}</div>
        <div class="weather-temp">${temp}°C</div>
        <div class="weather-desc">${description}</div>
      </div>
      <div class="weather-details">
        <span>💧 ${humidity}%</span>
        <span>🌡️ ${feelsLike}°C</span>
        <span>💨 ${windSpeed} m/s</span>
      </div>
    </div>
  `;
}

// event listener tombol search dan enter
btnSearch.addEventListener("click", handleSearch);
inputCity.addEventListener("keydown", function (e) {
  if (e.key === "Enter") handleSearch();
});

// auto load cuaca padang saat halaman pertama dibuka
getWeather("Padang");


// drag drop reorder todos
let draggedItem = null;

todoList.addEventListener("dragstart", function (e) {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  draggedItem = li;
  li.classList.add("dragging");
});

todoList.addEventListener("dragend", function (e) {
  const li = e.target.closest(".todo-item");
  if (li) li.classList.remove("dragging");
  draggedItem = null;
});

todoList.addEventListener("dragover", function (e) {
  e.preventDefault();
  const li = e.target.closest(".todo-item");
  if (!li || li === draggedItem) return;
  li.classList.add("drag-over");
});

todoList.addEventListener("dragleave", function (e) {
  const li = e.target.closest(".todo-item");
  if (li) li.classList.remove("drag-over");
});

todoList.addEventListener("drop", function (e) {
  e.preventDefault();
  const li = e.target.closest(".todo-item");
  if (!li || !draggedItem || li === draggedItem) return;

  const draggedId = Number(draggedItem.getAttribute("data-id"));
  const targetId = Number(li.getAttribute("data-id"));

  const fromIndex = todos.findIndex(function (t) { return t.id === draggedId; });
  const toIndex = todos.findIndex(function (t) { return t.id === targetId; });

  const moved = todos.splice(fromIndex, 1)[0];
  todos.splice(toIndex, 0, moved);

  li.classList.remove("drag-over");
  saveTodos();
  renderTodos();
});
