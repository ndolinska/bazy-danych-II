// app.js
require('dotenv').config();
const express = require('express');
const heroesRouter = require('./routes/heroes');
const incidentsRoutes = require('./routes/incidents');
const incidentController = require('./controllers/incidentController');

const app = express();
app.use(express.json());  
app.use('/api/v1/heroes', heroesRouter);
app.use('/api/v1/incidents', incidentsRoutes);
app.get('/', (req, res) => {
  res.send('Witaj w API Superbohaterów! Przejdź pod /api/v1/heroes, aby zobaczyć dane.');
});
app.get('/api/v1/stats', incidentController.getStats);
// Global error handler — ostatnia linia obrony
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

