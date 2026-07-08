# Polyglot To-Do List API REST & Unified Frontend 🚀

Este repositorio contiene implementaciones de una **API REST de To-Do List** construida bajo altos estándares de desarrollo en **5 lenguajes/frameworks diferentes**. Todas las APIs comparten la misma estructura de datos, respuestas y validaciones, lo que permite que sean consumidas por un único **Frontend Unificado**.

Además, el Frontend incluye un módulo de **Speed Test (Benchmark)** concurrente para poner a prueba el rendimiento real de cada lenguaje (Lectura, Escritura y Borrado bajo estrés) en tiempo real. 🏎️

---

## 🛠️ Ecosistema del Proyecto

| Proyecto | Tecnología Base | Puerto por defecto | Estado |
| :--- | :--- | :--- | :--- |
| **[springboot](./springboot/backend)** | Java 17 + Spring Boot | `8080` | **Completado** ✅ |
| **[node-express](./node-express)** | Node.js + Express | `3000` | **Completado** ✅ |
| **[nestjs](./nestjs)** | TypeScript + NestJS | `3001` | **Completado** ✅ |
| **[python-fastapi](./python-fastapi)** | Python 3 + FastAPI | `8000` | **Completado** ✅ |
| **[go-fiber](./go-fiber)** | Go + Fiber | `5000` | **Completado** ✅ |
| **[frontend](./frontend)** | HTML5/CSS3/JS (Vanilla) | `3002` (Recomendado) | **Completado** ✅ |

---

## 💻 Instrucciones de Despliegue (Cómo levantar todo)

Puedes encender uno, varios o todos los servidores al mismo tiempo (usando terminales separadas). El frontend detectará cuáles están encendidos automáticamente y los conectará a la herramienta de Benchmark.

### 🌐 1. Levantar el Frontend Unificado (Web UI)
El frontend se conecta a todos los puertos configurados.
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
npx -y http-server frontend -p 3002
```
*➡️ Entra a [http://localhost:3002](http://localhost:3002)*

---

### ☕ 2. Spring Boot (Java) - Puerto 8080
Abre una terminal en `springboot/backend` y ejecuta:
```bash
# Windows
.\mvnw spring-boot:run
# Mac/Linux
./mvnw spring-boot:run
```

### ⚡ 3. Node.js (Express) - Puerto 3000
Abre una terminal en `node-express` y ejecuta:
```bash
npm install
npm run dev
```

### 🦁 4. NestJS (TypeScript) - Puerto 3001
Abre una terminal en `nestjs` y ejecuta:
```bash
npm install
npm run start:dev
```

### 🐍 5. Python (FastAPI) - Puerto 8000
Abre una terminal en `python-fastapi` y ejecuta:
```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
# O simplemente: uvicorn main:app --port 8000 --reload
```

### 🐹 6. Go (Fiber) - Puerto 5000
Abre una terminal en `go-fiber` y ejecuta:
```bash
go mod tidy
go run main.go
```

---

## 🏆 Benchmark & Speed Test

Dentro del Frontend Unificado encontrarás un botón **🚀 Speed Test**. Si enciendes más de un servidor y ejecutas la prueba, el script disparará múltiples peticiones concurrentes a cada lenguaje de programación.

* **Fase 1:** Ping inicial.
* **Fase 2:** Inserción (`POST`) de 20 tareas en paralelo.
* **Fase 3:** Borrado (`DELETE`) de las 20 tareas en paralelo.
* **Resultado:** Un "Leaderboard" (Ranking) ordenando de menor a mayor los milisegundos que le tomó a cada tecnología soportar la carga. ¡Descubre qué framework domina el ecosistema!

---

## 🌟 Buenas Prácticas Aplicadas Transversalmente
* **Consistencia de Respuestas:** Todos los lenguajes serializan sus errores bajo el mismo objeto JSON (`validationErrors`) en camelCase.
* **Persistencia Integrada:** Todos utilizan bases de datos locales (H2 o SQLite) con sus respectivos ORMs (Hibernate, GORM, SQLAlchemy, etc).
* **Cross-Origin (CORS) estricto:** Ajustado a nivel aplicación y middleware en todos los frameworks para interoperabilidad segura con el panel JS del frontend.
