import axios from 'axios';

/**
 * Генерирует строку из 17 символов (0 или 1) для команды подсветки
 * @param {number} position - Позиция для установки единицы (1-17)
 *                            Позиции 1-16: подсветка для камней (по ID)
 *                            Позиция 17: общая подсветка
 * @returns {string} Строка из 17 символов с единицей на указанной позиции
 */
export function generateReleCommand(position) {
  // Создаем массив из 17 нулей
  const command = new Array(17).fill('0');

  // Устанавливаем единицу на указанной позиции (position - 1, т.к. индексация с 0)
  if (position >= 1 && position <= 17) {
    command[position - 1] = '1';
  }

  // Возвращаем строку
  return command.join('');
}

/**
 * Отправляет команду подсветки на устройство
 * @param {number} position - Позиция для установки единицы (1-17)
 */
export async function sendReleCommand(position) {
  try {
    const value = generateReleCommand(position);
    await axios.get(`http://192.168.0.101/cmd.cgi?cmd=REL,ALL,${value}`);
  } catch (error) {}
}
