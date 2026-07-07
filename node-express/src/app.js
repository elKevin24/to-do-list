const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const tasksRouter = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Todo API running with Node.js + Express' });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Todo API listening on http://localhost:${port}`);
});
