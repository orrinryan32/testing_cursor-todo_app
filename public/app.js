// Function to fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch('/api/todos');
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}

// Function to display todos
function displayTodos(todos) {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <div class="todo-content">
                <h3>${todo.title}</h3>
                <p>${todo.description || ''}</p>
                <small class="status-${todo.status}">${todo.status}</small>
            </div>
            <div class="todo-actions">
                <button onclick="toggleStatus(${todo.id}, '${todo.status === 'completed' ? 'pending' : 'completed'}')">
                    ${todo.status === 'completed' ? 'Undo' : 'Complete'}
                </button>
                <button class="delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;
        todoList.appendChild(todoItem);
    });
}

// Function to create a new todo
async function createTodo() {
    const titleInput = document.getElementById('todoTitle');
    const descriptionInput = document.getElementById('todoDescription');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) {
        alert('Please enter a title');
        return;
    }

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        });

        if (response.ok) {
            titleInput.value = '';
            descriptionInput.value = '';
            fetchTodos();
        }
    } catch (error) {
        console.error('Error creating todo:', error);
    }
}

// Function to toggle todo status
async function toggleStatus(id, newStatus) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

// Function to delete a todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTodos();
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Load todos when the page loads
document.addEventListener('DOMContentLoaded', fetchTodos); 