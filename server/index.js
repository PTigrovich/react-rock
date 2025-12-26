const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const ServerSetup = require('./utils/serverSetup');

const app = express();

// Инициализация ServerSetup для управления путями, запуском сервера и браузера
const serverSetup = new ServerSetup();

// Получаем пути из ServerSetup
const DATA_FILE = serverSetup.getDataFile();

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация файла данных
async function initializeData() {
  try {
    // Инициализируем директорию данных через ServerSetup
    await serverSetup.initializeDataDir();

    // Проверяем существование файла и создаем, если его нет
    const dataExists = await fs.pathExists(DATA_FILE);
    if (!dataExists) {
      // Создаем пустой файл, если его нет
      const initialData = [];
      await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
      console.log('✅ Создан новый файл данных');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации данных:', error);
    console.error('❌ Путь к файлу:', DATA_FILE);
  }
}

// Чтение данных из файла
async function readRocks() {
  try {
    const exists = await fs.pathExists(DATA_FILE);
    if (exists) {
      const data = await fs.readJson(DATA_FILE);
      console.log(`📖 Прочитано ${Array.isArray(data) ? data.length : 0} камней из файла`);
      return data;
    }
    console.warn(`⚠️  Файл данных не найден: ${DATA_FILE}`);
    return [];
  } catch (error) {
    console.error('❌ Ошибка чтения данных:', error);
    console.error('❌ Путь к файлу:', DATA_FILE);
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
    const oldId = parseInt(req.params.id);
    const rockIndex = rocks.findIndex((r) => r.id === oldId);

    if (rockIndex === -1) {
      return res.status(404).json({ error: 'Камень не найден' });
    }

    // Если ID изменяется, проверяем конфликты
    if (req.body.id && req.body.id !== oldId) {
      const newId = parseInt(req.body.id);

      // Проверяем, что новый ID не занят другим камнем
      const idExists = rocks.some((r, index) => r.id === newId && index !== rockIndex);
      if (idExists) {
        return res.status(400).json({ error: `ID ${newId} уже используется другим камнем` });
      }

      // Обновляем камень с новым ID
      rocks[rockIndex] = { ...rocks[rockIndex], ...req.body, id: newId };
    } else {
      // Обновляем без изменения ID (или если ID не указан в body)
      const { id, ...updateData } = req.body; // Исключаем id из обновления, если он не меняется
      rocks[rockIndex] = { ...rocks[rockIndex], ...updateData };
    }

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

// Настройка статических файлов через ServerSetup
// Размещено после API маршрутов, чтобы API запросы обрабатывались первыми
serverSetup.setupStaticFiles(app, express);

// Запуск сервера
async function startServer() {
  await initializeData();

  // Используем ServerSetup для запуска сервера и открытия браузера
  await serverSetup.startServer(app, async () => {
    // Дополнительная логика после запуска сервера (опционально)
    const buildDir = serverSetup.getBuildDir();

    // Проверяем наличие изображений
    const imagesDir = path.join(buildDir, 'images');
    fs.pathExists(imagesDir).then((exists) => {
      if (exists) {
        console.log(`✅ Папка images найдена: ${imagesDir}`);
      } else {
        console.warn(`⚠️  Папка images не найдена: ${imagesDir}`);
      }
    });
  });
}

startServer().catch(console.error);
