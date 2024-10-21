const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usersFilePath = path.join(__dirname, 'users.json');
const asistenciasFilePath = path.join(__dirname, 'asistencias.json');
const clasesFilePath = path.join(__dirname, 'clases.json');
const qrFilePath = path.join(__dirname, 'qr_actual.json');

function readQR() {
    if (!fs.existsSync(qrFilePath)) {
        fs.writeFileSync(qrFilePath, JSON.stringify({ qrData: '', clase: '', seccion: '', timestamp: 0 }));
    }
    const data = fs.readFileSync(qrFilePath);
    return JSON.parse(data);
}

function writeQR(qrData) {
    fs.writeFileSync(qrFilePath, JSON.stringify(qrData, null, 2));
}

let qrActual = readQR();

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

function readClases() {
    try {
        if (!fs.existsSync(clasesFilePath)) {
            console.error('El archivo clases.json no existe');
            return [];
        }
        const data = fs.readFileSync(clasesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo clases.json:', error);
        return [];
    }
}

function obtenerUsuarioPorEmail(email) {
    const users = readUsers();
    return users.find(user => user.email === email);
}

function actualizarUsuario(updatedUser) {
    const users = readUsers();
    const index = users.findIndex(user => user.email === updatedUser.email);
    if (index !== -1) {
        users[index] = updatedUser;
        writeUsers(users);
        return true;
    }
    return false;
}

app.get('/users', (req, res) => {
    const { email } = req.query;
    if (email) {
        const user = obtenerUsuarioPorEmail(email);
        if (user) {
            res.json([user]);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } else {
        const users = readUsers();
        res.json(users);
    }
});

app.put('/users/:email', (req, res) => {
    const { email } = req.params;
    const updatedUser = req.body;
    
    if (email !== updatedUser.email) {
        return res.status(400).json({ message: 'El email en la URL no coincide con el email en el cuerpo de la solicitud' });
    }

    const success = actualizarUsuario(updatedUser);
    if (success) {
        res.json({ message: 'Usuario actualizado exitosamente' });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
});

app.post('/register', (req, res) => {
    const { nombre, email, password, role } = req.body;
    const users = readUsers();

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'Este correo ya a sido usado' });
    }

    const newUser = { nombre, email, password, role };
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'Usuario Registrado con exito' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        res.json({ token: 'fake-jwt-token', user: { nombre: user.nombre, email: user.email, role: user.role } });
    } else {
        res.status(401).json({ message: 'Credenciales invalidas' });
    }
});


app.delete('/clear-asistencias', (req, res) => {
    try {
        writeAsistencias([]);
        res.status(200).json({ message: 'Asistencia borrada con exito' });
    } catch (error) {
        console.error('Error al borrar asistencia:', error);
        res.status(500).json({ message: 'Error al borrar asistencia' });
    }
});


app.post('/asistencia', (req, res) => {
    const { nombre, correo, fechaHora, clase, seccion, qrData } = req.body;
    console.log('Datos recibidos:', { nombre, correo, fechaHora, clase, seccion, qrData });
    console.log('QR actual:', qrActual);

    if (qrData !== qrActual.qrData) {
        return res.status(400).json({ message: 'Código QR no válido o expirado' });
    }

    if (clase !== qrActual.clase || seccion !== qrActual.seccion) {
        return res.status(400).json({ message: 'Clase o sección no válidas' });
    }

    const asistencias = readAsistencias();
    const nuevaAsistencia = { nombre, correo, fechaHora, clase, seccion };
    asistencias.push(nuevaAsistencia);
    writeAsistencias(asistencias);
    res.status(201).json({ message: 'Asistencia registrada con éxito' });
});

app.post('/qr-generado', (req, res) => {
    const { clase, seccion, qrData } = req.body;
    qrActual = {
        qrData,
        clase,
        seccion,
        timestamp: Date.now()
    };
    writeQR(qrActual);
    console.log('Nuevo QR generado:', qrActual);
    res.status(200).json({ message: 'Estado de generación de código QR actualizado' });
});

app.get('/qr-disponible', (req, res) => {
    qrActual = readQR();
    res.json({ disponible: !!qrActual.qrData, qrData: qrActual.qrData });
});

app.get('/asistencias', (req, res) => {
    const asistencias = readAsistencias();
    res.json(asistencias);
});

app.get('/clases', (req, res) => {
    const clases = readClases();
    if (clases.length === 0) {
        res.status(500).json({ message: 'Error al leer las clases o el archivo está vacío' });
    } else {
        res.json(clases);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});