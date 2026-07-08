const express = require('express');
const { body, validationResult, param } = require('express-validator');
const db = require('../db');

const router = express.Router();

const taskValidation = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('description').optional().isString().withMessage('description must be a string'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean')
];

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return null;
}

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = {};
    errors.array().forEach(err => {
      validationErrors[err.path || err.param] = err.msg;
    });
    return res.status(400).json({ validationErrors });
  }
  next();
}

function formatTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get('/', (req, res, next) => {
  db.all('SELECT * FROM tasks ORDER BY id ASC', [], (error, rows) => {
    if (error) return next(error);
    const tasks = rows.map(formatTask);
    res.json(tasks);
  });
});

router.get('/:id', param('id').isInt().withMessage('id must be an integer'), handleValidationErrors, (req, res, next) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (error, row) => {
    if (error) return next(error);
    if (!row) return res.status(404).json({ error: 'Task not found' });
    res.json(formatTask(row));
  });
});

router.post('/', taskValidation, handleValidationErrors, (req, res, next) => {
  const { title, description } = req.body;
  const completed = false;
  const createdAt = new Date().toISOString();

  db.run(
    'INSERT INTO tasks (title, description, completed, created_at) VALUES (?, ?, ?, ?)',
    [title, description || null, completed ? 1 : 0, createdAt],
    function (error) {
      if (error) return next(error);
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (getError, row) => {
        if (getError) return next(getError);
        res.status(201).json(formatTask(row));
      });
    }
  );
});

router.put('/:id', [param('id').isInt().withMessage('id must be an integer'), ...taskValidation], handleValidationErrors, (req, res, next) => {
  const { title, description, completed } = req.body;
  const completedValue = completed === undefined ? null : toBoolean(completed);
  const updatedAt = new Date().toISOString();

  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (error, row) => {
    if (error) return next(error);
    if (!row) return res.status(404).json({ error: 'Task not found' });

    const updatedTitle = title !== undefined ? title : row.title;
    const updatedDescription = description !== undefined ? description : row.description;
    const updatedCompleted = completedValue !== null ? (completedValue ? 1 : 0) : row.completed;

    db.run(
      'UPDATE tasks SET title = ?, description = ?, completed = ?, updated_at = ? WHERE id = ?',
      [updatedTitle, updatedDescription, updatedCompleted, updatedAt, req.params.id],
      function (updateError) {
        if (updateError) return next(updateError);
        db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (getError, updatedRow) => {
          if (getError) return next(getError);
          res.json(formatTask(updatedRow));
        });
      }
    );
  });
});

router.delete('/:id', param('id').isInt().withMessage('id must be an integer'), handleValidationErrors, (req, res, next) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function (error) {
    if (error) return next(error);
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  });
});

module.exports = router;
