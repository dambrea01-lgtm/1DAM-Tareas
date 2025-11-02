# 🚢 Laboratorio SAP ABAP – Gestión de Operaciones Portuarias

[↩️ Volver al inicio](../../README.md)

---

[![Ver Diagrama Automoviles](img/laboratorio_ABAP_SAP.png)](docs/laboratorio_ABAP_SAP.pdf)

---

## 🎯 Objetivo de la práctica

El objetivo principal de este laboratorio fue **poner en práctica los fundamentos de desarrollo en SAP ABAP**, aprendiendo a crear tablas, vistas, funciones y reportes que interactúan entre sí dentro del entorno SAP.

Durante la práctica se realizaron las siguientes tareas:

1. Crear una **tabla con al menos un campo con dominio**.
2. Generar una **vista de mantenimiento** asociada a la tabla.
3. Crear una **función en el módulo SE37**.
4. Desarrollar un **report (programa ABAP)** que utilice la tabla y la función creadas.

---

## ⚙️ Desarrollo de la práctica

### 🧱 Creación de la tabla `ZPUERTO`

La práctica se basó en la temática de **operaciones en un puerto marítimo**, modelando una tabla que almacena información sobre los barcos.  
A través del **infotipo SE11**, se creó la tabla `ZPUERTO`, configurando:

- Clase de entrega: **C**
- Clase de datos: **APPL0**
- Categoría de tamaño: **0**
- Campos obligatorios: `MANDT` (mandante)
- Campos con dominios personalizados, como:
  - **TIPO_BARCO** → dominio de tipos de barcos.
  - **UE** → dominio para identificar si un barco pertenece a la Unión Europea.

👉 Con esta parte, aprendí a **definir estructuras de datos reutilizables** mediante dominios y tipos de datos propios del sistema SAP, aplicando una correcta modelización en ABAP Dictionary.

---

### 🔍 Creación de una vista de mantenimiento

A continuación, generé la vista de mantenimiento `ZVD_PUERTO` desde SE11, configurada como **vista de actualización** (tipo A), lo que permitió **insertar, modificar y visualizar datos directamente desde el sistema**.

También aprendí a:

- Asociar la vista a un **grupo de funciones**.
- Activar el grupo desde SE80.
- **Probar la inserción y verificación de registros** mediante las transacciones SE16 y SE16N.

✅ Este paso me enseñó la importancia de **la integridad y administración de datos dentro del entorno SAP**, además de cómo mantener la coherencia entre tablas y vistas de usuario.

---

### 🧩 Creación de una función con SE37

En esta fase, diseñé una **función modular** que recibe un parámetro (`IUB`, Identificador Único de Buque) y devuelve el registro correspondiente de la tabla `ZPUERTO`.

Aprendí a:

- Crear un **grupo de funciones (Z_FUNCION_GRUPO)**.
- Definir **parámetros de importación y exportación**.
- Implementar **lógica de búsqueda mediante sentencias SELECT** en ABAP.
- Activar la función desde SE80 y SE38.

💡 Con este ejercicio adquirí práctica en la **programación modular y reutilizable** en SAP ABAP, aplicando buenas prácticas en la creación de funciones.

---

### 🖥️ Creación de un Report ABAP

Por último, desarrollé un **programa (report)** que permite al usuario introducir un IUB y obtener los datos del barco correspondiente.

El programa:

- Llama a la función creada en SE37.
- Verifica si el IUB existe.
- Muestra los datos del barco o un **mensaje de error** si no se encuentra.

📘 Este apartado reforzó mis conocimientos sobre:

- **Sintaxis y estructura de programas ABAP.**
- **Interacción entre programas y funciones.**
- **Gestión de errores y validación de datos.**

---

## 📚 Conocimientos adquiridos

Durante esta práctica he aprendido a:

- Dominar el **entorno de desarrollo SAP ABAP** (SE11, SE37, SE38, SE80, SE16N).
- **Diseñar y gestionar tablas y vistas de mantenimiento.**
- **Crear funciones modulares reutilizables.**
- **Programar reports en ABAP** conectados a funciones y tablas.
- Comprender cómo **los distintos objetos del sistema SAP se integran** para ofrecer soluciones empresariales coherentes.

> 🧭 Además, la temática del puerto marítimo me permitió aplicar una lógica de negocio realista, modelando un escenario cercano a la gestión logística y operativa.

---

## 🌟 Conclusión

> Esta práctica de laboratorio me ha permitido afianzar mis conocimientos en **SAP ABAP**, comprendiendo la potencia de este entorno para el desarrollo de soluciones empresariales integradas.

> Gracias a este ejercicio, adquirí una **visión completa del flujo de datos en SAP**, desde la definición de estructuras hasta la presentación final mediante reports.

> “Aprender ABAP no es solo escribir código, es entender cómo SAP estructura el mundo empresarial.”

---

## 🧰 Recursos utilizados

- Entorno de desarrollo **SAP GUI / ABAP Workbench**
- Transacciones: SE11, SE37, SE38, SE80, SE16, SE16N
- Documentación oficial de SAP Learning Hub
- Ejemplos de código de prácticas docentes
