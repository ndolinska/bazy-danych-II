// app.js
require('dotenv').config();
const express = require('express');
const heroesRouter = require('./routes/heroes');
const incidentsRoutes = require('./routes/incidents');

const app = express();
app.use(express.json());         // parsowanie JSON body
app.use('/api/v1/heroes', heroesRouter);
app.use('/api/v1/incidents', incidentsRoutes);

// Global error handler — ostatnia linia obrony
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

