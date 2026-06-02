# Entidades del Sistema — CRUDs por Módulo

> Cada entidad usa un nombre en inglés (`snake_case`) listo para usar como **interface** en TypeScript o **modelo** en el backend. Las descripciones se mantienen en español.

---
# Admin Module

## 1. User

**Tabla:** `users`

| Columna    | Tipo            | Restricciones       |
|------------|-----------------|---------------------|
| id         | String (UUID)   | PK, auto-increment  |
| name       | String          | nullable            |
| email      | String          | unique, not null    |
| password   | String          | not null            |
| role       | UserRole (enum) | default: VISITOR    |
| state      | State (enum)    | default: ACTIVE     |
| created_at | LocalDateTime   | auto                |
| updated_at | LocalDateTime   | auto                |

**Enum UserRole:** `ADMIN` (Administrador) · `EXHIBITOR` (Expositor) · `VISITOR` (Visitante)

**Relaciones:**
- One-to-Many → `Exhibitor`
- One-to-Many → `Meeting` (como solicitante)
- One-to-Many → `Meeting` (como receptor)

---

## 2. FairEdition

**Tabla:** `fair_editions`

| Columna    | Tipo          | Restricciones      |
|------------|---------------|--------------------|
| id         | String (UUID) | PK, auto-increment |
| name       | String        | not null           |
| start_date | LocalDate     | nullable           |
| end_date   | LocalDate     | nullable           |
| state      | State (enum)  | default: ACTIVE    |
| created_at | LocalDateTime | auto               |
| updated_at | LocalDateTime | auto               |

**Relaciones:**
- One-to-Many → `Exhibitor`
- One-to-Many → `Meeting`

---

## 3. Category

**Tabla:** `categories`

| Columna     | Tipo          | Restricciones      |
|-------------|---------------|--------------------|
| id          | String (UUID) | PK, auto-increment |
| name        | String        | not null           |
| description | String        | nullable           |
| state       | State (enum)  | default: ACTIVE    |
| created_at  | LocalDateTime | auto               |
| updated_at  | LocalDateTime | auto               |

**Relaciones:**
- One-to-Many → `Product`

---

## 4. Exhibitor

**Tabla:** `exhibitors`

| Columna      | Tipo          | Restricciones               |
|--------------|---------------|-----------------------------|
| id           | String (UUID) | PK, auto-increment          |
| user_id      | UUID (FK)     | not null → users.id         |
| edition_id   | UUID (FK)     | not null → fair_editions.id |
| company_name | String        | nullable                    |
| sector       | String        | nullable                    |
| logo_url     | String        | nullable                    |
| state        | State (enum)  | default: ACTIVE             |
| created_at   | LocalDateTime | auto                        |
| updated_at   | LocalDateTime | auto                        |

**Relaciones:**
- Many-to-One → `User`
- Many-to-One → `FairEdition`
- One-to-Many → `Product`

---

## 5. Product

**Tabla:** `products`

| Columna      | Tipo            | Restricciones             |
|--------------|-----------------|---------------------------|
| id           | String (UUID)   | PK, auto-increment        |
| exhibitor_id | UUID (FK)       | not null → exhibitors.id  |
| category_id  | UUID (FK)       | nullable → categories.id  |
| name         | String          | not null                  |
| price        | BigDecimal(8,2) | nullable                  |
| state        | State (enum)    | default: ACTIVE           |
| created_at   | LocalDateTime   | auto                      |
| updated_at   | LocalDateTime   | auto                      |

**Relaciones:**
- Many-to-One → `Exhibitor`
- Many-to-One → `Category`
- One-to-Many → `ProductImage`
- One-to-Many → `ProductVisit`

---

## 6. ProductImage

**Tabla:** `product_images`

| Columna    | Tipo          | Restricciones          |
|------------|---------------|------------------------|
| id         | String (UUID) | PK, auto-increment     |
| product_id | UUID (FK)     | not null → products.id |
| url        | String        | nullable               |
| sort_order | Integer       | nullable               |
| created_at | LocalDateTime | auto                   |
| updated_at | LocalDateTime | auto                   |

**Relaciones:**
- Many-to-One → `Product`

---

## 7. ProductVisit

**Tabla:** `product_visits`

| Columna    | Tipo          | Restricciones          |
|------------|---------------|------------------------|
| id         | String (UUID) | PK, auto-increment     |
| product_id | UUID (FK)     | not null → products.id |
| visitor_ip | String        | nullable               |
| visited_at | LocalDateTime | not null               |
| created_at | LocalDateTime | auto                   |
| updated_at | LocalDateTime | auto                   |

**Relaciones:**
- Many-to-One → `Product`

---

## 8. Meeting

**Tabla:** `meetings`

| Columna      | Tipo                | Restricciones               |
|--------------|---------------------|-----------------------------|
| id           | String (UUID)       | PK, auto-increment          |
| requester_id | UUID (FK)           | not null → users.id         |
| receiver_id  | UUID (FK)           | not null → users.id         |
| edition_id   | UUID (FK)           | not null → fair_editions.id |
| state        | MeetingState (enum) | default: PENDING            |
| created_at   | LocalDateTime       | auto                        |
| updated_at   | LocalDateTime       | auto                        |

**Enum MeetingState:** `PENDING` (Pendiente) · `CONFIRMED` (Confirmada) · `CANCELED` (Cancelada) · `COMPLETED` (Completada)

**Relaciones:**
- Many-to-One → `User` (como solicitante — `requester_id`)
- Many-to-One → `User` (como receptor — `receiver_id`)
- Many-to-One → `FairEdition`
