// benchmark.js

document.addEventListener('DOMContentLoaded', () => {
    const btnBenchmark = document.getElementById('btn-benchmark');
    const modal = document.getElementById('benchmark-modal');
    const btnClose = document.getElementById('btn-close-modal');
    const btnStart = document.getElementById('btn-start-race');
    const resultsContainer = document.getElementById('benchmark-results');

    if (!btnBenchmark || !modal) return;

    // Muestra el modal
    btnBenchmark.addEventListener('click', () => {
        modal.style.display = 'flex';
        if (resultsContainer.innerHTML.trim() === '') {
            resultsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">Presiona "Iniciar Carrera" para medir el rendimiento.</div>';
        }
    });

    // Oculta el modal
    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Inicia la carrera
    btnStart.addEventListener('click', async () => {
        btnStart.disabled = true;
        btnStart.innerText = '⏳ Corriendo Pruebas...';
        resultsContainer.innerHTML = '<div style="text-align:center; padding: 2rem;">Corriendo stress test concurrente (20 Inserciones + 20 Borrados) en cada servidor...</div>';

        const results = [];

        // Evaluamos cada backend definido en BACKENDS (desde app.js)
        for (const key of Object.keys(BACKENDS)) {
            const backend = BACKENDS[key];
            try {
                // Ping inicial rápido para ver si está vivo con un timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000);
                const ping = await fetch(backend.url, { method: 'GET', signal: controller.signal });
                clearTimeout(timeoutId);

                if (!ping.ok) throw new Error("Server not OK");

                // Start timer
                const startTime = performance.now();

                // 1. Crear 20 tareas concurrentes
                const createPromises = [];
                for (let i = 0; i < 20; i++) {
                    createPromises.push(
                        fetch(backend.url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: `Benchmark Task ${i} - ${backend.name}`,
                                description: 'Speed Test',
                            })
                        }).then(res => res.json())
                    );
                }

                const createdTasks = await Promise.all(createPromises);

                // 2. Borrar las 20 tareas concurrentemente
                const deletePromises = [];
                for (const task of createdTasks) {
                    if (task && task.id) {
                        const delUrl = backend.url.endsWith('/') ? `${backend.url}${task.id}` : `${backend.url}/${task.id}`;
                        deletePromises.push(
                            fetch(delUrl, { method: 'DELETE' })
                        );
                    }
                }
                
                await Promise.all(deletePromises);

                const endTime = performance.now();
                const totalTime = Math.round(endTime - startTime);

                results.push({
                    key,
                    name: backend.name,
                    time: totalTime,
                    status: 'success'
                });

            } catch (error) {
                // Servidor offline o falló
                results.push({
                    key,
                    name: backend.name,
                    time: Infinity,
                    status: 'offline'
                });
            }
        }

        renderLeaderboard(results);
        
        btnStart.disabled = false;
        btnStart.innerText = '🏁 Repetir Carrera';
    });

    function renderLeaderboard(results) {
        // Ordenamos por tiempo de menor a mayor
        results.sort((a, b) => a.time - b.time);

        // Determinamos el tiempo máximo (excluyendo offline) para el ancho de la barra
        const validTimes = results.filter(r => r.status === 'success').map(r => r.time);
        const maxTime = validTimes.length > 0 ? Math.max(...validTimes) : 1000;

        resultsContainer.innerHTML = '';
        
        const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];

        results.forEach((res, index) => {
            const isOffline = res.status === 'offline';
            const timeDisplay = isOffline ? 'OFFLINE' : `${res.time} ms`;
            const medal = isOffline ? '❌' : (medals[index] || '');
            
            // Calculamos el ancho de la barra (el más lento tiene la barra más ancha)
            const width = isOffline ? 0 : Math.max(5, (res.time / maxTime) * 100);
            
            // Colores especiales: Oro para el 1er lugar
            const barStyle = isOffline 
                ? 'background: transparent;' 
                : (index === 0 && !isOffline 
                    ? `width: ${width}%; background: linear-gradient(90deg, #ffd700, #ff8c00);` 
                    : `width: ${width}%;`);

            const row = document.createElement('div');
            row.className = 'result-row';
            row.innerHTML = `
                <div class="result-info">
                    <span><span class="medal">${medal}</span> <strong>${res.name}</strong></span>
                    <span class="result-time" style="${isOffline ? 'color: var(--accent-red)' : ''}">${timeDisplay}</span>
                </div>
                <div class="result-bar-container">
                    <div class="result-bar" style="${barStyle}"></div>
                </div>
            `;
            // Pequeño timeout para animar la barra desde 0% al width final
            setTimeout(() => {
                const bar = row.querySelector('.result-bar');
                if (bar && !isOffline) {
                    bar.style.width = `${width}%`;
                }
            }, 50);

            resultsContainer.appendChild(row);
        });
    }
});
