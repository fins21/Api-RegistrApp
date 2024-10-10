// benjamin ascensio, pablo carrasco, ivan sepulveda. Todos los derechos reservados.

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usersFilePath = path.join(__dirname, 'users.json');
const asistenciasFilePath = path.join(__dirname, 'asistencias.json');

function readUsers() {
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, '[]');
    }
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function readAsistencias() {
    if (!fs.existsSync(asistenciasFilePath)) {
        fs.writeFileSync(asistenciasFilePath, '[]');
    }
    const data = fs.readFileSync(asistenciasFilePath);
    return JSON.parse(data);
}

function writeAsistencias(asistencias) {
    fs.writeFileSync(asistenciasFilePath, JSON.stringify(asistencias, null, 2));
}

app.post('/register', (req, res) => {
    const { nombre, email, password, role } = req.body;
    const users = readUsers();

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = { nombre, email, password, role };
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

app.get('/users', (req, res) => {
    const users = readUsers();
    res.json(users);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        res.json({ token: 'fake-jwt-token', user: { nombre: user.nombre, email: user.email, role: user.role } });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Nuevo endpoint para registrar asistencia
app.post('/asistencia', (req, res) => {
    const { nombre, correo, fechaHora } = req.body;
    const asistencias = readAsistencias();

    const nuevaAsistencia = { nombre, correo, fechaHora };
    asistencias.push(nuevaAsistencia);
    writeAsistencias(asistencias);

    res.status(201).json({ message: 'Asistencia registrada con éxito' });
});

// Nuevo endpoint para obtener todas las asistencias
app.get('/asistencias', (req, res) => {
    const asistencias = readAsistencias();
    res.json(asistencias);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});