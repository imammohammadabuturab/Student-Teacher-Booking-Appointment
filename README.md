# Student-Teacher Booking Appointment

**Project**: Student-Teacher Booking Appointment  
**Domain**: Education  
**Difficulty**: Easy  
**Technologies**: HTML, CSS, JavaScript, Firebase (Auth, Firestore/Realtime DB, Hosting)  
**Author**: Imam Mohammad Abuturab  
**Repository**: https://github.com/imammohammadabuturab/Student-Teacher-Booking-Appointment

---

## About

A web-based appointment booking system that allows students and teachers to manage appointments from any device. Students can register, search teachers, book appointments, and send messages. Teachers can approve/cancel appointments and view messages. The application uses Firebase for authentication, database, and hosting. This README follows the submission and documentation requirements in the project brief. :contentReference[oaicite:1]{index=1}

---

## Features

- Admin: add/update/delete teachers; approve student registrations.
- Teacher: login, view schedule, approve/cancel appointments, view messages.
- Student: register, login, search teachers, book appointment, view appointments, send messages.
- Common: logging for key actions, basic input validation, responsive UI.

---

## System Architecture (high level)

1. **Frontend**: Static single-page layout built with HTML/CSS/JS.
2. **Backend-as-a-Service**: Firebase Authentication for users, Firestore (or Realtime DB) for storing teachers, students, appointments, messages, and logs.
3. **Hosting**: Firebase Hosting for deployment.
4. **Logging**: Client-side action logs written to a `logs` collection in Firestore (each log entry: `timestamp`, `userId`, `action`, `details`).

> See `docs/ARCHITECTURE.md` for a simple component diagram and data flow (add this file to repo).

---

## Project structure (suggested)

