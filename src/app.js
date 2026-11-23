const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');
const { noEncontrado, manejadorErrores } = require('./middlewares/errores');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/salud', async (req, res) => {
    console.log('Ruta de prueba');
  const [filas] = await pool.query('SELECT 1 AS ok');
  res.json(filas[0]);
});

app.get('api/usuarios' , async (req, res) => {
  const [usuarios] = await pool.query();
});

app.get('/api/habitaciones', async (req, res) =>{
    const [habitaciones] = await pool.query("SELECT * FROm habitaciones");
    res.json(habitaciones);
});

app.use('/api/tipos-habitacion', require('./rutas/tipos-habitacion.rutas'));
app.use('/api/habitaciones', require('./rutas/habitaciones.rutas'));

app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;