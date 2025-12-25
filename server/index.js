const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Определяем базовую директорию: если запущен через pkg, используем директорию exe файла
const isPkg = typeof process.pkg !== 'undefined';
let baseDir;

if (isPkg) {
  // При запуске через pkg, exe файл находится в build/, поэтому baseDir = директория exe
  baseDir = path.dirname(process.execPath);
} else {
  // При обычном запуске через node
  baseDir = path.join(__dirname, '..');
}

// Путь к файлу данных: при сборке в build/data/, при разработке в public/data/
const DATA_FILE = isPkg
  ? path.join(baseDir, 'data', 'rocks.json') // build/data/rocks.json
  : path.join(baseDir, 'public', 'data', 'rocks.json'); // public/data/rocks.json

// Определяем BUILD_DIR: проверяем, где находится index.html
let BUILD_DIR;
if (isPkg) {
  // Если запущен через pkg, exe в build/, проверяем наличие index.html в той же директории
  const indexInBaseDir = path.join(baseDir, 'index.html');
  BUILD_DIR = baseDir; // По умолчанию используем baseDir (где находится exe)
} else {
  // При обычном запуске через node
  BUILD_DIR = path.join(baseDir, 'build');
}

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация файла данных
async function initializeData() {
  try {
    await fs.ensureDir(path.dirname(DATA_FILE));

    // Проверяем существование файла
    const dataExists = await fs.pathExists(DATA_FILE);
    console.log(`📂 Проверка файла данных: ${DATA_FILE}`);
    console.log(`📂 Файл существует: ${dataExists}`);

    if (!dataExists) {
      // Создаем пустой файл, если его нет
      const initialData = [];
      await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
      console.log('✅ Создан новый файл данных');
    } else {
      console.log('✅ Файл данных найден');
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

// Раздача статических файлов из build (CSS, JS, изображения и т.д.)
// Размещено после API маршрутов, чтобы API запросы обрабатывались первыми
app.use(express.static(BUILD_DIR));

// Fallback для SPA роутинга - все не-API запросы возвращают index.html
// Должен быть последним, чтобы обрабатывать все маршруты, не обработанные выше
app.use((req, res, next) => {
  // Пропускаем API запросы
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Для всех остальных запросов возвращаем index.html
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

// Функция открытия браузера в kiosk режиме (только для Windows)
async function openBrowser() {
  if (os.platform() !== 'win32') {
    console.log('⚠️  Автоматическое открытие браузера поддерживается только на Windows');
    return;
  }

  const url = `http://localhost:${PORT}/`;
  const chromePath = process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe';

  // Проверяем наличие Chrome
  const chromeExists = await fs.pathExists(chromePath);

  if (chromeExists) {
    // Открываем Chrome в kiosk режиме
    exec(
      `"${chromePath}" --disable-web-security --user-data-dir="${os.tmpdir()}\\ChromeTempProfile" --autoplay-policy=no-user-gesture-required --app="${url}" --start-fullscreen --kiosk --disable-features=Translate,ContextMenuSearchWebFor,ImageSearch`,
      (error) => {
        if (error) {
          console.error('❌ Ошибка открытия Chrome:', error);
        }
      }
    );

    // Убиваем explorer.exe через 12 секунд для чистого kiosk режима
    setTimeout(() => {
      exec('taskkill /f /im explorer.exe', (error) => {
        if (error && !error.message.includes('не найден')) {
          console.error('⚠️  Не удалось закрыть explorer.exe:', error.message);
        }
      });
    }, 12000);
  } else {
    // Проверяем наличие Edge
    const edgeExists = await fs.pathExists(edgePath);

    if (edgeExists) {
      // Настраиваем Edge политики
      exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});
      exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "ContextMenuSearchEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});
      exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "VisualSearchEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});

      // Открываем Edge в kiosk режиме
      exec(
        `"${edgePath}" --kiosk "${url}" --edge-kiosk-type=fullscreen --no-first-run --disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch --disable-component-update --disable-prompt-on-repost --kiosk-idle-timeout-minutes=0`,
        (error) => {
          if (error) {
            console.error('❌ Ошибка открытия Edge:', error);
          }
        }
      );
    } else {
      console.error('❌ Не найден ни Chrome, ни Edge. Откройте браузер вручную:', url);
    }
  }
}

// Запуск сервера
async function startServer() {
  await initializeData();

  // Проверяем существование index.html
  const indexHtmlPath = path.join(BUILD_DIR, 'index.html');
  const indexExists = await fs.pathExists(indexHtmlPath);

  if (!indexExists) {
    console.error(`❌ Ошибка: файл index.html не найден по пути: ${indexHtmlPath}`);
    console.log(`📂 BUILD_DIR: ${BUILD_DIR}`);
    console.log(`📂 baseDir: ${baseDir}`);
    console.log(`📂 isPkg: ${isPkg}`);
    console.log(`📂 process.execPath: ${process.execPath}`);
    console.log(`📂 process.cwd(): ${process.cwd()}`);

    // Пробуем найти index.html в текущей директории
    const currentDirIndex = path.join(process.cwd(), 'index.html');
    if (await fs.pathExists(currentDirIndex)) {
      console.log(`✅ Найден index.html в текущей директории: ${currentDirIndex}`);
    }
  } else {
    console.log(`✅ index.html найден: ${indexHtmlPath}`);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Данные сохраняются в: ${DATA_FILE}`);
    console.log(`📂 Статические файлы из: ${BUILD_DIR}`);
    console.log(`📂 baseDir: ${baseDir}`);
    console.log(`🌐 API доступно по адресу: http://localhost:${PORT}/api`);
    console.log(`🎨 Приложение: http://localhost:${PORT}`);

    // Проверяем наличие изображений
    const imagesDir = path.join(BUILD_DIR, 'images');
    fs.pathExists(imagesDir).then((exists) => {
      if (exists) {
        console.log(`✅ Папка images найдена: ${imagesDir}`);
      } else {
        console.warn(`⚠️  Папка images не найдена: ${imagesDir}`);
      }
    });

    // Открываем браузер через небольшую задержку
    setTimeout(async () => {
      await openBrowser();
    }, 1000);
  });
}

startServer().catch(console.error);
