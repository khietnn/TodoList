const API_URL = "https://6825dedf397e48c91313f421.mockapi.io/tasks";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const addButton = document.getElementById("add-button");
const todoList = document.querySelector(".todos-list");
const todoStatus = document.getElementById("todo-status");
const todoCount = document.getElementById("todo-count");

let todos = [];

// Màu nút của hộp thoại SweetAlert, khớp với màu của trang
const dialog = Swal.mixin({
  confirmButtonColor: "#16a34a",
  cancelButtonColor: "#6b7280",
  cancelButtonText: "Hủy",
});

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
});

function showNotification(message, icon = "success") {
  toast.fire({ title: message, icon });
}

function formatDate(value) {
  const date = new Date(value);
  return `${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${date.toLocaleDateString("vi-VN")}`;
}

function setStatus(message) {
  todoStatus.textContent = message;
  todoStatus.hidden = !message;
}

// Vẽ lại danh sách. Dùng textContent thay vì innerHTML để nội dung có dấu nháy hay thẻ HTML không làm vỡ trang.
function render() {
  todoList.innerHTML = "";
  todos.forEach((item) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (item.isCompleted ? " completed" : "");

    const label = document.createElement("label");
    label.className = "todo-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.isCompleted;
    checkbox.addEventListener("change", () => handleToggle(item, checkbox.checked));

    const text = document.createElement("div");
    text.className = "todo-text";
    const content = document.createElement("span");
    content.className = "todo-title";
    content.textContent = item.content;
    const time = document.createElement("small");
    time.textContent = formatDate(item.createdAt);
    text.append(content, time);
    label.append(checkbox, text);

    const actions = document.createElement("div");
    actions.className = "todo-actions";
    actions.append(
      iconButton("fa-pen-to-square", "edit-button", "Sửa", () => handleUpdate(item)),
      iconButton("fa-trash", "delete-button", "Xóa", () => handleDelete(item)),
    );

    li.append(label, actions);
    todoList.appendChild(li);
  });

  const remaining = todos.filter((t) => !t.isCompleted).length;
  todoCount.textContent = todos.length ? `${remaining}/${todos.length} chưa xong` : "";
  setStatus(todos.length ? "" : "Chưa có công việc nào. Thêm một việc ở trên nhé!");
}

function iconButton(icon, className, label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`;
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = `<i class="fa-solid ${icon}"></i>`;
  button.addEventListener("click", onClick);
  return button;
}

// GET
async function getTodos() {
  try {
    const response = await axios.get(API_URL);
    todos = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    render();
  } catch (error) {
    console.log(error);
    setStatus("Không tải được danh sách. Hãy thử tải lại trang.");
  }
}

// POST
async function addTodo(event) {
  event.preventDefault();
  const inputData = todoInput.value.trim();
  if (!inputData) {
    todoInput.focus();
    return;
  }

  addButton.disabled = true;
  try {
    await axios.post(API_URL, {
      createdAt: new Date().toISOString(),
      content: inputData,
      isCompleted: false,
    });
    todoInput.value = "";
    await getTodos();
    showNotification("Đã thêm công việc");
  } catch (error) {
    console.log(error);
    showNotification("Thêm thất bại, thử lại nhé", "error");
  } finally {
    addButton.disabled = false;
    todoInput.focus();
  }
}

// PUT: đánh dấu hoàn thành
async function handleToggle(item, isCompleted) {
  item.isCompleted = isCompleted;
  render();
  try {
    await axios.put(`${API_URL}/${item.id}`, { isCompleted });
  } catch (error) {
    console.log(error);
    item.isCompleted = !isCompleted;
    render();
    showNotification("Cập nhật thất bại", "error");
  }
}

// PUT: sửa nội dung
function handleUpdate(item) {
  dialog.fire({
    title: "Chỉnh sửa công việc",
    input: "text",
    inputValue: item.content,
    inputAttributes: { autocapitalize: "off", maxlength: "200" },
    showCancelButton: true,
    confirmButtonText: "Lưu",
    showLoaderOnConfirm: true,
    inputValidator: (value) => (!value.trim() ? "Nội dung không được để trống" : undefined),
    preConfirm: async (inputData) => {
      try {
        await axios.put(`${API_URL}/${item.id}`, { content: inputData.trim() });
      } catch (error) {
        Swal.showValidationMessage("Lưu thất bại, thử lại nhé");
        return false;
      }
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      await getTodos();
      showNotification("Đã cập nhật công việc");
    }
  });
}

// DELETE
function handleDelete(item) {
  dialog.fire({
    title: "Xóa công việc này?",
    text: "Sau khi xóa sẽ không khôi phục lại được.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    confirmButtonColor: "#dc2626",
    reverseButtons: true,
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        await axios.delete(`${API_URL}/${item.id}`);
      } catch (error) {
        Swal.showValidationMessage("Xóa thất bại, thử lại nhé");
        return false;
      }
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      await getTodos();
      showNotification("Đã xóa công việc");
    }
  });
}

todoForm.addEventListener("submit", addTodo);
getTodos();
