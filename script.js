// ambil elemen HTML
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

// addEventListener submit pada form
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


// toggle selesai / belum selesai
// pakai event delegation karena todo-item dibuat dinamis oleh js
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


// edit todo (double-click)
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

// localStorage
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


// drag & drop (reorder todos)
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
