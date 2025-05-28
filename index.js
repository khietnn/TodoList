const API_URL = ("https://6825dedf397e48c91313f421.mockapi.io/tasks");

const todoInput = document.getElementById("todo-input");
const addButton = document.getElementById("add-button"); 


document.addEventListener("DOMContentLoaded", getTodos);
addButton.addEventListener("click", addTodo);
// GET FUNCTION
async function getTodos() {
  try {
  const response = await axios
  .get(API_URL);
  console.log(response.data);
  const ul = document.querySelector(".todos-list")
  ul.innerHTML = "";
  response.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  response.data.forEach((item) => {
    // tạo ra thẻ li
    const li = document.createElement("li");
    // gán class vào
    li.className ="todo-item";
    // format day
    const date = new Date(item.createdAt);
    const formatDate = `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`;
    // gắn thằng con và nội dung từ API cho thằng con
    li.innerHTML = `
        <div class="todo-content">
          <input type="checkbox">
          <div>
            <span>${item.content}</span>
            <div>Created at: ${formatDate}</div>
          </div>
        </div>
          <div class="todo-actions">
            <button onclick ="handleUpdate(${item.id},'${item.content}')"><i class="fa-solid fa-pen-to-square edit-button"></i></button>
            <button onclick ="handleDelete(${item.id})"><i class="fa-solid fa-trash delete-button"></i></button>
          </div>
        `;
    // lấy ra danh sách ul

    ul.appendChild(li);
  });
  } catch (error) {
    console.log(error);
  }
}

// POST FUNCTION
async function addTodo() {
  // trim(): dùng để ngăn khoảng trống trước chữ đầu tiên
  const inputData = todoInput.value.trim();

  const newTodo = {    
    "createdAt": new Date().toISOString(),
    "content": inputData,
    "isCompleted": false,
  }

  try {
    const response = await axios.post(API_URL, newTodo);
    todoInput.value = "";
    getTodos();
    showNotification("Đã lưu thành công");
  } 
  catch (error) {
  console.log("That bai roi", error);
  }
}

// PUT FUNCTION
function handleUpdate(id,content){
  Swal.fire({
    title: "Chỉnh sửa nhiệm vụ",
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
  },
  inputValue: content,
  showCancelButton: true,
  confirmButtonText: "Xác nhận",
  showLoaderOnConfirm: true,
  preConfirm: async (inputData) => {
    await axios.put(`${API_URL}/${id}`, {
      content: inputData,
    });
    getTodos();
    showNotification("Đã cập nhật nhiệm vụ");
  }
  });
}

function showNotification(message){
  Swal.fire({
      title: message,
      icon: "success",
      draggable: true,
      backdrop: `
      rgba(0,0,123,0.4)
      url("https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExanJ2aTBjdGZzeHhjbGxoZXE4YnM1dDhpNTVzOTd4dGNkYzlpenc2cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7lsw8RenVcjCM/giphy.gif")
      top
      no-repeat
      `
  });
}

// DELETE FUNCTION
function handleDelete(id){
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });
  swalWithBootstrapButtons.fire({
    title: "Bạn chắc chứ",
    text: "Khi nhấn nút xóa bạn sẽ không thể khôi phục lại!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    reverseButtons: true
  }).then(async(result) => {
    if (result.isConfirmed) {
      await axios.delete(`${API_URL}/${id}`),
      getTodos();
      showNotification("Đã xóa nhiệm vụ");
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire({
        title: "Đã hủy",
        text: "hủy xóa rồi á",
        icon: "error"
      });
    }
  });
}