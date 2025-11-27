import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminPage.module.scss';
import { createRock, getRocks, updateRock } from '../../api/rocksApi';

const emptyForm = {
  name: '',
  image: '',
  description: '',
  modelPath: '',
};

const AdminPage = () => {
  const [rocks, setRocks] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRocks = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const data = await getRocks();
      setRocks(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message || 'Не удалось получить список камней');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRocks();
  }, [loadRocks]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = (rock) => {
    setEditingId(rock.id);
    setFormValues({
      name: rock.name || '',
      image: rock.image || '',
      description: rock.description || '',
      modelPath: rock.modelPath || '',
    });
    setFormError('');
    setSuccessMessage('');
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setSaving(true);

    const payload = {
      name: formValues.name.trim(),
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      modelPath: formValues.modelPath.trim(),
    };

    if (!payload.name || !payload.description) {
      setFormError('Название и описание обязательны');
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateRock(editingId, payload);
        setSuccessMessage('Камень обновлён');
      } else {
        await createRock(payload);
        setSuccessMessage('Камень добавлен');
      }
      await loadRocks();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.badge}>Админ-панель</p>
          <h1>Коллекция камней</h1>
        </div>
        <Link to="/" className={styles.homeLink}>
          ← Вернуться в галерею
        </Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.listSection}>
          <div className={styles.sectionHeader}>
            <h2>Все камни</h2>
            <span>{rocks.length}</span>
          </div>

          {loading && <p className={styles.status}>Загружаем...</p>}
          {!loading && listError && <p className={styles.error}>{listError}</p>}

          {!loading && !listError && (
            <ul className={styles.list}>
              {rocks.map((rock) => (
                <li key={rock.id} className={styles.listItem}>
                  <div>
                    <p className={styles.listItemTitle}>{rock.name || 'Без названия'}</p>
                    {rock.image && <p className={styles.listItemMeta}>{rock.image}</p>}
                  </div>
                  <button type="button" className={styles.editButton} onClick={() => startEdit(rock)}>
                    Редактировать
                  </button>
                </li>
              ))}

              {rocks.length === 0 && <p className={styles.status}>Список пуст</p>}
            </ul>
          )}
        </section>

        <section className={styles.formSection}>
          <h2>{editingId ? 'Редактировать камень' : 'Добавить новый камень'}</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Название
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                placeholder="Например, Аметист"
              />
            </label>

            <label className={styles.label}>
              Ссылка на изображение
              <input
                type="text"
                name="image"
                value={formValues.image}
                onChange={handleInputChange}
                placeholder="/images/rock1.png"
              />
            </label>

            <label className={styles.label}>
              Описание
              <textarea
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Краткое описание минерала..."
              />
            </label>

            <label className={styles.label}>
              Путь к 3D модели (опционально)
              <input
                type="text"
                name="modelPath"
                value={formValues.modelPath}
                onChange={handleInputChange}
                placeholder="/models/amethyst.glb"
              />
            </label>

            {formError && <p className={styles.error}>{formError}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}

            <div className={styles.formActions}>
              {editingId && (
                <button type="button" className={styles.secondaryButton} onClick={resetForm}>
                  Отменить
                </button>
              )}
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;

