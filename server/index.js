const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, '../data/rocks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация файла данных
async function initializeData() {
  try {
    await fs.ensureDir(path.dirname(DATA_FILE));

    if (!(await fs.pathExists(DATA_FILE))) {
      const initialData = [
        {
          id: 1,
          name: 'Аметист',
          description: 'Фиолетовая разновидность кварца, известная своими красивыми кристаллами.',
          image: '/api/placeholder/300/300',
          modelPath: '/models/amethyst.glb',
        },
        {
          id: 2,
          name: 'Малахит',
          description: 'Фиолетовая разновидность кварца, известная своими красивыми кристаллами.',
          image: '/api/placeholder/300/300',
          modelPath: '/models/amethyst.glb',
        },
        {
          id: 3,
          name: 'Малахит',
          description: 'Фиолетовая разновидность кварца, известная своими красивыми кристаллами.',
          image: '/api/placeholder/300/300',
          modelPath: '/models/amethyst.glb',
        },
      ];

      await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
      console.log('✅ Инициализирован файл данных с примерами камней');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации данных:', error);
  }
}

// Чтение данных из файла
async function readRocks() {
  try {
    if (await fs.pathExists(DATA_FILE)) {
      return await fs.readJson(DATA_FILE);
    }
    return [];
  } catch (error) {
    console.error('❌ Ошибка чтения данных:', error);
    return [];
  }
}

// Запись данных в файл
async function writeRocks(rocks) {
  try {
    await fs.writeJson(DATA_FILE, rocks, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('❌ Ошибка записи данных:', error);
    return false;
  }
}

// API Routes

// GET /api/rocks - получить все камни
app.get('/api/rocks', async (req, res) => {
  try {
    const rocks = await readRocks();
    res.json(rocks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// GET /api/rocks/:id - получить камень по ID
app.get('/api/rocks/:id', async (req, res) => {
  try {
    const rocks = await readRocks();
    const rock = rocks.find((r) => r.id === parseInt(req.params.id));

    if (!rock) {
      return res.status(404).json({ error: 'Камень не найден' });
    }

    res.json(rock);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// POST /api/rocks - создать новый камень
app.post('/api/rocks', async (req, res) => {
  try {
    const rocks = await readRocks();
    const newRock = {
      ...req.body,
      id: Date.now(), // Простой ID генератор
    };

    rocks.push(newRock);
    const success = await writeRocks(rocks);

    if (success) {
      res.status(201).json(newRock);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания камня' });
  }
});

// PUT /api/rocks/:id - обновить камень
app.put('/api/rocks/:id', async (req, res) => {
  try {
    const rocks = await readRocks();
    const rockIndex = rocks.findIndex((r) => r.id === parseInt(req.params.id));

    if (rockIndex === -1) {
      return res.status(404).json({ error: 'Камень не найден' });
    }

    rocks[rockIndex] = { ...rocks[rockIndex], ...req.body };
    const success = await writeRocks(rocks);

    if (success) {
      res.json(rocks[rockIndex]);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления камня' });
  }
});

// DELETE /api/rocks/:id - удалить камень
app.delete('/api/rocks/:id', async (req, res) => {
  try {
    const rocks = await readRocks();
    const filteredRocks = rocks.filter((r) => r.id !== parseInt(req.params.id));

    if (rocks.length === filteredRocks.length) {
      return res.status(404).json({ error: 'Камень не найден' });
    }

    const success = await writeRocks(filteredRocks);

    if (success) {
      res.json({ message: 'Камень успешно удален' });
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления камня' });
  }
});

// Запуск сервера
async function startServer() {
  await initializeData();

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Данные сохраняются в: ${DATA_FILE}`);
    console.log(`🌐 API доступно по адресу: http://localhost:${PORT}/api`);
    console.log(`🎨 Приложение: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
