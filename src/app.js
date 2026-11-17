const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pool = require('./db');
const { noEncontrado, manejadorErrores } = require('./middlewares/errores');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta temporal para probar la conexión; bórrala cuando tengas tus rutas reales
app.get('/api/salud', async (req, res) => {
    console.log('Ruta de prueba');
  const [filas] = await pool.query('SELECT 1 AS ok');
  res.json(filas[0]);
});

// Aquí se montarán las rutas, por ejemplo:
// app.use('/api/habitaciones', require('./rutas/habitaciones.rutas'));
// app.use('/api/reservas', require('./rutas/reservas.rutas'));

app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;