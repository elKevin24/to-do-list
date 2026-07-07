# Polyglot To-Do List API REST 🚀

Este repositorio contiene implementaciones de una **API REST de To-Do List** construida bajo altos estándares de desarrollo, buenas prácticas de diseño de software y utilizando diferentes stacks tecnológicos para comparar su arquitectura, sintaxis y rendimiento.

---

## 🛠️ Ecosistema del Proyecto

Actualmente, el repositorio cuenta con las siguientes implementaciones:

| Proyecto | Tecnología Base | Persistencia | Mapeo / Validación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **[springboot/backend](./springboot/backend)** | Java 17 + Spring Boot 4.1.0 | H2 Database (JPA / Hibernate) | MapStruct / `@Valid` (Jakarta) | **Completado** ✅ |
| **[springboot/frontend](./springboot/frontend)** | HTML5 + CSS3 + JS (Nativo) | Spring Boot REST API | Fetch API | **Completado** ✅ |
| **[node-express](./node-express)** | Node.js + Express | Memory DB / Custom | Custom | **En Progreso** 🛠️ |
| **[nestjs](./nestjs)** | TypeScript + NestJS | Memory / TypeORM | Custom DTOs / Class-Validator | **En Progreso** 🛠️ |

---

## ☕ 1. Implementación en Java & Spring Boot (con Frontend integrado)

Ubicada en la carpeta `/springboot`, esta implementación separa claramente el cliente (Frontend) y el servidor (Backend).

### A. Backend (`/springboot/backend`)
Sigue la **Arquitectura en 3 Capas** (Controlador, Servicio y Repositorio) aplicando inyección de dependencias, Clean Code y tipado estático.

*   **Tecnologías:** Java 17 (LTS), Spring Boot 4.1.0, H2 Database, Lombok, MapStruct, Springdoc OpenAPI (Swagger UI).
*   **Cómo ejecutar el Backend:**
    Abre la terminal en la carpeta `springboot/backend` y ejecuta:
    ```bash
    .\mvnw spring-boot:run
    ```
    *   **Consola H2:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:todolistdb`, usuario `sa` sin contraseña).
    *   **Documentación Swagger UI:** `http://localhost:8080/swagger-ui.html`

### B. Frontend (`/springboot/frontend`)
Una interfaz web interactiva con tema oscuro y Glassmorphism que consume el Backend en tiempo real.

*   **Tecnologías:** HTML5 semántico, Vanilla CSS3 (diseño responsivo, variables HSL, animaciones), JavaScript nativo (Fetch API, manipulación asíncrona del DOM).
*   **Cómo ejecutar el Frontend:**
    Puedes abrir el archivo `index.html` directamente en tu navegador, o servirlo con un servidor web simple (por ejemplo, con Node.js en el puerto 3001):
    Abre la terminal en la carpeta `springboot/frontend` y ejecuta:
    ```bash
    npx -y http-server -p 3001
    ```
    Y entra a: `http://localhost:3001`

---

## ⚡ 2. Otras Implementaciones (Node.js & NestJS)
Este repositorio incluye implementaciones en Node.js (Express) y NestJS para comparar la velocidad de desarrollo y la arquitectura de Spring Boot frente al ecosistema de JavaScript/TypeScript.

*   Para ver los detalles del desarrollo en Express, dirígete a la carpeta `/node-express`.
*   Para la implementación en NestJS, consulta la carpeta `/nestjs`.

---

## 🌟 Buenas Prácticas Aplicadas
*   **Separación de DTOs y Entidades:** Protege la base de datos de inyecciones maliciosas y oculta propiedades internas del sistema.
*   **Manejo Global de Excepciones:** Respuestas JSON estandarizadas en caso de errores en la API (ej: campos de entrada inválidos, recursos no encontrados).
*   **Pruebas Automatizadas:** Cobertura de pruebas unitarias tanto para la lógica de negocio (`Service`) como para la capa de presentación web (`MockMvc` en los controladores).
*   **Documentación Automatizada:** Especificación OpenAPI disponible inmediatamente para su integración con el frontend.
