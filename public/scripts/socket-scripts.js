const socket = io.connect();

function createTask(event) {
    const text = document.getElementById("taskText").value;
    const date = document.getElementById("taskDate").value;
    if (text != "" || date != "") {
        const task = {text: text, date: date}
        document.forms.newTask.reset();
        socket.emit('createTask', task);
    }
    else {alert("Fill in all the fields!");}
}

socket.on("loadTasksContainer", (tasks) => {
    console.log(tasks);
    loadTasksContainer(tasks);
});

function deleteTasks(event) {
    const id = event.target.dataset.task;
    console.log(id);
    socket.emit('deleteTask', id);
}

function updateTask(event) {
    const target = event.target;
    const id = target.dataset.task;
    console.log(id);
    socket.emit('updateTask', id);
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
        edit.onclick = updateTask;
        edit.dataset.task = task.id;
        edit.style.width = "20px";
        edit.style.height = "20px";
        edit.src = "../public/img/edit.png";
        edit.style.cursor = "pointer";
        controls.appendChild(edit);

        const deleteTask = document.createElement("img");
        deleteTask.onclick = deleteTasks;
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


function fillTasksTable(tasks) {
    let table = document.getElementById("tasksTable");
    clearTable(table);
    for (const task of tasks) {
        let row = table.insertRow();
        row.dataset.task = task.id;
        row.addEventListener('dblclick', deleteTask);
        row.addEventListener('click', updateTask);
        
        let idCell = row.insertCell();
        idCell.append(task.id);

        let text = row.insertCell();
        text.append(task.text);

        let days = Math.round((new Date(task.date) - Date.now()) / (1000 * 3600 * 24)) + 1;

        let daysLeftText = "";
        if (task.completed) {
            row.classList.add("completed-task");
            daysLeftText = "Completed";
        } else {
            if (days == 0) {
                row.classList.add("attention-task");
                daysLeftText = "Do today";
            } else if (days == 1) {
                row.classList.add("tommorow-task");
                daysLeftText = "Do tomorrow";
            } else if (days < 0){
                row.classList.add("expired-task");
                daysLeftText = "Time is over";
            }
            else {
                row.classList.add("non-completed-task");
                daysLeftText = days + " day(s)";
            }
        }
        let daysLeft = row.insertCell();
        daysLeft.append(daysLeftText);
    }
}
