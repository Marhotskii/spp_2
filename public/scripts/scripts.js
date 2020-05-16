'use strict'

let tasks = []

function loadTasks() {
    fetch("http://127.0.0.1:4444/tasks/")
    .then(response => response.json())
    .then(tasks => {
        loadTasksContainer(tasks);
        
    })
}

function loadTasksContainer(tasks) {
    const container = document.getElementById("tasksMain");
    container.innerHTML = "";
    for (const task of tasks) {
        const taskBlock = document.createElement("div");
        taskBlock.className = "task";
        container.appendChild(taskBlock);

        const controls = document.createElement("div");
        controls.className = "controls d-flex justify-content-between";

        const edit = document.createElement("img");
        edit.onclick = editClick;
        edit.dataset.task = task.id;
        
        edit.style.width = "20px";
        edit.style.height = "20px";
        edit.src = "../public/img/edit.png";
        edit.style.cursor = "pointer";
        controls.appendChild(edit);

        const deleteTask = document.createElement("img");
        deleteTask.onclick = deleteClick;
        deleteTask.dataset.task = task.id;
        deleteTask.src = "../public/img/delete.png";
        
        deleteTask.style.width = "20px";
        deleteTask.style.height = "20px";
        deleteTask.style.cursor = "pointer";
        controls.appendChild(deleteTask);
        taskBlock.appendChild(controls);

        const taskMain = document.createElement("div");
        taskMain.className = "task-main";
        taskBlock.appendChild(taskMain);

        const taskText = document.createElement("div");
        taskText.className = "text-wrap text-break";
        taskText.style.fontWeight = "bold";
        taskText.appendChild(document.createTextNode(task.text));

        taskMain.appendChild(taskText);

        const attachments = document.createElement("div");
        attachments.appendChild(document.createTextNode("Attachments: "))
        attachments.style.fontSize = "12px";
        attachments.style.fontWeight = "lighter";
        if (task.filename != undefined) {
            let link = document.createElement("a");
            var linkText = document.createTextNode("Download");
            link.appendChild(linkText);
            link.title = "download";
            link.href = task.filename;
            attachments.appendChild(link);
        }
        else {
            attachments.append("no attachments");
        }
        taskMain.appendChild(attachments);

        const date = document.createElement("div");
        date.style.fontSize = "12px";
        date.className = "d-flex justify-content-end";
        taskMain.style.fontWeight = "bold";

        let days = Math.round((new Date(task.endTime) - Date.now()) / (1000 * 3600 * 24)) + 1;

        let daysLeftText = "";
        if (task.completed) {
            taskBlock.classList.add("completed-task");
            daysLeftText = "Completed";
        } else {
            if (days == 0) {
                taskBlock.classList.add("attention-task");
                daysLeftText = "Do today";
            } else if (days == 1) {
                taskBlock.classList.add("tommorow-task");
                daysLeftText = "Do tomorrow";
            } else if (days < 0){
                taskBlock.classList.add("expired-task");
                daysLeftText = "Time is over";
            }
            else {
                taskBlock.classList.add("non-completed-task");
                daysLeftText = days + " day(s)";
            }
        }
        date.append(daysLeftText);
        taskMain.appendChild(date);

    }

}

function cancelEdit() {
    let form = document.getElementById("newTaskForm");
    form.classList.remove("deleted");
    let editForm = document.getElementById("editTaskForm");
    editForm.classList.add("deleted");
    document.forms.editTask.reset();
    document.forms.newTask.reset();
}

function edit() {
    let form = document.forms.editTask;
    let formData = new FormData(form);
    form.reset();
    fetch("http://127.0.0.1:4444/tasks/", {
        method: "PUT",
        body: formData
    })
    .then(response => {
        if (response.status != 200) {
            alert( 'Error: ' + response.status);
            return;
        }
        let form = document.getElementById("newTaskForm");
        form.classList.remove("deleted");
        let editForm = document.getElementById("editTaskForm");
        editForm.classList.add("deleted");
        loadTasks();
    });
}

function deleteClick(e) {
    const id = e.target.dataset.task;
    deleteTask(id)
}

function editClick(e) {
    let form = document.getElementById("newTaskForm");
    form.classList.add("deleted");
    let editForm = document.getElementById("editTaskForm");
    editForm.classList.remove("deleted");

    let deleteFile = document.getElementById("deleteFile");
    deleteFile.value = false;

    let id = e.target.dataset.task;
    console.log("CLICKED edit task id: " + id);
    let taskId = document.getElementById("taskId");
    let text = document.getElementById("taskText");
    let date = document.getElementById("taskDate");
    let file = document.getElementById("taskFile");
    file.innerHTML = "";
    let completed = document.getElementById("completed");
    fetch("http://127.0.0.1:4444/tasks/" + id)
    .then(response => response.json())
    .then(task => {
        console.log(task);
        taskId.value = task.id;
        text.value = task.text;
        let taskDate = new Date(task.endTime);
        date.value = getDateString(taskDate);
        completed.checked = task.completed;
        if (task.filename != undefined) {
            let link = document.createElement("div");
            var linkText = document.createTextNode("Скачать");
            link.appendChild(linkText);
            link.dataset.file = task.filename;
            link.className = "btn btn-info";
            link.addEventListener("click", downloadFile);

            let deleteDiv = document.createElement("div");
            var deleteText = document.createTextNode("Удалить");
            deleteDiv.className = "btn btn-info";
            deleteDiv.appendChild(deleteText);
            deleteDiv.addEventListener("click", setFieldToDeleteFile);
            file.appendChild(deleteDiv);
            file.appendChild(link);
        }
        else {
            file.append("нет вложений");
        }
    });
}

function downloadFile(e) {
    let link = e.target.dataset.file;
    console.log("DOWNLOAD: " + link);
    let element = document.createElement('a');
    element.href = link;
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function setFieldToDeleteFile() {
    console.log("here");
    let deleteFile = document.getElementById("deleteFile");
    deleteFile.value = true;
    let file = document.getElementById("taskFile");
    file.innerHTML = "no attachments";
}

function getDateString(date) {
    let dd = date.getDate();
    let mm = date.getMonth()+1; 
    const yyyy = date.getFullYear();
    if(dd<10) 
    {
        dd=`0${dd}`;
    } 

    if(mm<10) 
    {
        mm=`0${mm}`;
    } 
    return `${yyyy}-${mm}-${dd}`;
}

function createTask() {
    let form = document.forms.newTask;
    let formData = new FormData(form);
    form.reset();

    fetch("http://127.0.0.1:4444/tasks/", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.status != 200) { 
            alert( 'Error: ' + response.status);
            return;
          }
        
          loadTasks();
    });
}

function deleteTask(id) {
    console.log("DELETE ID:" + id);

    fetch("http://127.0.0.1:4444/tasks/" + id, {
        method: "DELETE"
    })
    .then(response => {
        if (response.status != 200) { 
            alert( 'Error: ' + response.status);
            return;
          }
          
        loadTasks();
    });
}

loadTasks();