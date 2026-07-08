// CONFIGURACIÓN DE MULTI-BACKEND
const BACKENDS = {
    springboot: { name: 'Spring Boot (Java)', url: 'http://localhost:8080/api/tasks' },
    express: { name: 'Express (Node.js)', url: 'http://localhost:3000/tasks' },
    nestjs: { name: 'NestJS (TypeScript)', url: 'http://localhost:3001/tasks' },
    fastapi: { name: 'Python (FastAPI)', url: 'http://localhost:8000/tasks' },
    go: { name: 'Go (Fiber)', url: 'http://localhost:5000/tasks' }
};

// ESTADO ACTIVO
let currentBackendKey = localStorage.getItem('selectedBackend') || 'springboot';
let API_URL = BACKENDS[currentBackendKey].url;

// ELEMENTOS DEL DOM
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-description');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const listLoader = document.getElementById('list-loader');
const connectionAlert = document.getElementById('connection-alert');
const btnSubmit = document.getElementById('btn-submit');
const btnRefresh = document.getElementById('btn-refresh');
const backendSelect = document.getElementById('backend-select');

// ELEMENTOS DE ESTADÍSTICAS
const statTotalVal = document.querySelector('#stat-total .stat-value');
const statPendingVal = document.querySelector('#stat-pending .stat-value');
const statCompletedVal = document.querySelector('#stat-completed .stat-value');

// LISTADO LOCAL DE TAREAS (ESTADO DE LA APLICACIÓN)
let tasks = [];

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Configurar selector con el backend persistido
    backendSelect.value = currentBackendKey;

    // Escanear servidores e iniciar carga de tareas
    scanAllServers();
    fetchTasks();

    // Eventos
    taskForm.addEventListener('submit', handleCreateTask);
    btnRefresh.addEventListener('click', () => {
        scanAllServers();
        fetchTasks();
    });

    // Evento de cambio de backend
    backendSelect.addEventListener('change', (e) => {
        currentBackendKey = e.target.value;
        localStorage.setItem('selectedBackend', currentBackendKey);
        API_URL = BACKENDS[currentBackendKey].url;
        fetchTasks();
    });
});

// OBTENER TODAS LAS TAREAS (GET)
async function fetchTasks() {
    showLoader(true);
    hideConnectionAlert();

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error('Error al recuperar tareas:', error);
        showConnectionAlert();
        // Limpiamos listas y reseteamos estadísticas a 0
        tasks = [];
        updateStats();
        taskList.style.display = 'none';
        emptyState.style.display = 'none';
    } finally {
        showLoader(false);
    }
}

// CREAR TAREA (POST)
async function handleCreateTask(e) {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();

    if (!title) return;

    // Desactivamos el botón para evitar múltiples envíos
    setSubmitLoading(true);
    hideConnectionAlert();

    const payload = {
        title: title,
        description: description,
        completed: false
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Manejo de errores de validación enviados por GlobalExceptionHandler
            if (response.status === 400) {
                const errorData = await response.json();
                if (errorData.validationErrors) {
                    const messages = Object.values(errorData.validationErrors).join('\n');
                    alert(`Error de validación:\n${messages}`);
                    return;
                }
            }
            throw new Error(`Error en el servidor: ${response.status}`);
        }

        const newTask = await response.json();
        
        // Agregar al listado local al principio e inicializar
        tasks.unshift(newTask);
        renderTasks();

        // Limpiar el formulario
        taskForm.reset();
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        showConnectionAlert();
    } finally {
        setSubmitLoading(false);
    }
}

// ACTUALIZAR ESTADO DE COMPLETADO (PUT)
async function toggleTaskStatus(id, checked) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const originalTask = tasks[taskIndex];
    
    // Objeto con la información modificada
    const payload = {
        title: originalTask.title,
        description: originalTask.description,
        completed: checked
    };

    // Actualización optimista en la interfaz local
    tasks[taskIndex].completed = checked;
    updateStats();
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        if (checked) {
            taskElement.classList.add('completed');
        } else {
            taskElement.classList.remove('completed');
        }
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error al actualizar estado: ${response.status}`);
        }

        const updatedTask = await response.json();
        // Sincronizamos con el estado real retornado por el servidor
        tasks[taskIndex] = updatedTask;
        renderTasks(); // Re-renderizar para actualizar las fechas de modificación si aplica
    } catch (error) {
        console.error('Error al actualizar tarea, revirtiendo estado local:', error);
        // Revertir cambios en caso de error
        tasks[taskIndex].completed = !checked;
        renderTasks();
        showConnectionAlert();
    }
}

// ELIMINAR TAREA (DELETE)
async function deleteTask(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea permanentemente?')) return;

    // Buscar elemento en el DOM y aplicar animación de salida
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateY(10px)';
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }

        // Remover del listado local
        tasks = tasks.filter(t => t.id !== id);
        
        // Esperamos a que la transición de opacidad de CSS termine (300ms)
        setTimeout(() => {
            renderTasks();
        }, 300);
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        renderTasks(); // Restaurar UI local
        showConnectionAlert();
    }
}

// RENDERIZAR TAREAS EN LA UI
function renderTasks() {
    updateStats();

    if (tasks.length === 0) {
        taskList.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';
    taskList.style.display = 'flex';
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-id', task.id);

        const formattedDate = formatDate(task.createdAt);

        taskItem.innerHTML = `
            <div class="task-item-left">
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id}, this.checked)">
                    <span class="checkmark"></span>
                </label>
                <div class="task-content">
                    <span class="task-item-title">${escapeHTML(task.title)}</span>
                    ${task.description ? `<p class="task-item-desc">${escapeHTML(task.description)}</p>` : ''}
                    <span class="task-item-date">Creada: ${formattedDate}</span>
                </div>
            </div>
            <button class="btn-delete" onclick="deleteTask(${task.id})" title="Eliminar tarea">
                <svg class="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
        `;

        taskList.appendChild(taskItem);
    });
}

// ACTUALIZAR CONTADORES DE ESTADÍSTICAS
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    statTotalVal.textContent = total;
    statCompletedVal.textContent = completed;
    statPendingVal.textContent = pending;
}

// UTILIDADES AUXILIARES
function showLoader(show) {
    listLoader.style.display = show ? 'flex' : 'none';
    if (show) {
        taskList.style.display = 'none';
        emptyState.style.display = 'none';
    }
}

function setSubmitLoading(loading) {
    btnSubmit.disabled = loading;
    const btnText = btnSubmit.querySelector('.btn-text');
    const btnLoader = btnSubmit.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

function showConnectionAlert() {
    connectionAlert.innerHTML = `<strong>Error de Conexión:</strong> No se pudo establecer conexión con el backend de <strong>${BACKENDS[currentBackendKey].name}</strong> en <code>${API_URL}</code>. Asegúrate de tener este servidor encendido.`;
    connectionAlert.style.display = 'block';
}

function hideConnectionAlert() {
    connectionAlert.style.display = 'none';
}

// ESCANEO Y SALUD DE LOS SERVIDORES (ONLINE/OFFLINE)
async function checkServerStatus(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200); // 1.2 segundos de timeout
    try {
        const response = await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(id);
        // Si responde, el servidor está arriba (sea cual sea el status HTTP, por ejemplo 404, 200, 400)
        return true;
    } catch (err) {
        return false;
    }
}

async function scanAllServers() {
    for (const [key, backend] of Object.entries(BACKENDS)) {
        const isOnline = await checkServerStatus(backend.url);
        const pill = document.getElementById(`status-${key}`);
        if (pill) {
            if (isOnline) {
                pill.classList.remove('offline');
                pill.classList.add('online');
            } else {
                pill.classList.remove('online');
                pill.classList.add('offline');
            }
        }
    }
}

// Dar formato legible a la fecha
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escapar HTML para evitar inyección XSS de tareas cargadas
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
