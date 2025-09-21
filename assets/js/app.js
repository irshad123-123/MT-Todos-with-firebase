let cl = console.log;

const todoForm = document.getElementById('todoForm')
const todoItemControler = document.getElementById('todoItem')
const updateTodo = document.getElementById('updateTodo')
const addTodo = document.getElementById('addTodo')
const todoContainer = document.getElementById('todoContainer')
const loadar = document.getElementById('loadar')

const snackBar = (msg, icon)=>{
    Swal.fire({
        title:msg,
        icon:icon,
        timer:1500
    })
}

let BASE_URL = `https://crud-35fc1-default-rtdb.asia-southeast1.firebasedatabase.app`
let TODO_URL = `${BASE_URL}/todos.json`

let objtoArr = (obj)=>{
    let todoArr = []
    for(const key in obj){
        todoArr.unshift({...obj[key], id : key})
    }
    return todoArr
}

const todoTemplating = (arr) =>{
    let result = ``;
    arr.forEach(obj=>{
        result += `<li id="${obj.id}" class="list-group-item d-flex justify-content-between align-items-center">
                        <strong>${obj.todoItem}</strong>
                        <div>
                            <i onclick ="onEdit(this)" class="fa-solid fa-user-pen fa-2x text-success" role="button"></i>
                            <i onclick ="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </div>
                    </li>`
    })
    todoContainer.innerHTML = result;
}

const onEdit = async (ele) =>{
    let Edit_Id = ele.closest('li').id;
    cl(Edit_Id)
    localStorage.setItem('Edit_Id', Edit_Id)
    let Edit_URL = `${BASE_URL}/todos/${Edit_Id}.json`
    
    let res = await MakeApiCall('GET', Edit_URL, null)
    snackBar('The data is patch successfully!!!', 'success')
    todoItemControler.value = res.todoItem;
    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
}

const onRemove = async (ele) =>{
  let r = await  Swal.fire({
  title: "Do you want to remove this todo?",
  showCancelButton: true,
}).then((result) => {
  /* Read more about isConfirmed, isDenied below */
  if (result.isConfirmed) {
    let Remove_Id = ele.closest('li').id;
    let Remove_URL = `${BASE_URL}/todos/${Remove_Id}.json`
    MakeApiCall('DELETE', Remove_URL, null)
    ele.closest('li').remove()
  }
});

}

const MakeApiCall = async (methodName, api_url, msgBody) =>{
    let msg = msgBody ? JSON.stringify(msgBody) : null;
    try{
        loadar.classList.remove('d-none')
        let res = await fetch(api_url, {
        method:methodName,
        body: msg,
        headers:{
            "auth": "JWT token from LS",
            "content-type":"application/json"
        }
    })
    if(!res.ok){
        throw new Error('Network Error')
    }
    return res.json()
    }catch{
        cl('Error')
    }finally{
        loadar.classList.add('d-none')
    }
}

const allTodos = async () =>{
    let res = await MakeApiCall('GET', TODO_URL, null)
    let posts = objtoArr(res)
    todoTemplating(posts)
}
allTodos()

const onSubmitTodo = async (eve) =>{
    eve.preventDefault()
    let obj = {
        todoItem : todoItemControler.value
    }
    cl(obj)
    let res = await MakeApiCall('POST', TODO_URL, obj)
    todoForm.reset()
    let li = document.createElement('li')
    li.id = res.id;
    li.className = `list-group-item d-flex justify-content-between align-items-center`
    li.innerHTML = `<strong>${obj.todoItem}</strong>
                        <div>
                            <i onclick ="onEdit(this)" class="fa-solid fa-user-pen fa-2x text-success" role="button"></i>
                            <i onclick ="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </div>`
    todoContainer.prepend(li)
    snackBar('The data is added successfully!!!', 'success')

}

const onUpdateTodo = async (eve) =>{
    let Update_Id = localStorage.getItem('Edit_Id')
    cl(Update_Id)
    let Update_URL = `${BASE_URL}/todos/${Update_Id}.json`
    let Update_Obj = {
        todoItem : todoItemControler.value,
        id : Update_Id
    }
    cl(Update_Obj)
    let res = await MakeApiCall('PATCH', Update_URL, Update_Obj)
    snackBar('The data is updated successfully!!!', 'success')

    todoForm.reset()
    let strong = document.getElementById(Update_Id).children
    // cl(strong)
    strong[0].innerHTML = res.todoItem
    addTodo.classList.remove('d-none')
    updateTodo.classList.add('d-none')

}

todoForm.addEventListener('submit', onSubmitTodo)

updateTodo.addEventListener('click', onUpdateTodo)