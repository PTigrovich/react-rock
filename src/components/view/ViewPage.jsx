import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ViewPage.module.scss';
import { getRockById } from '../../api/rocksApi';
import { sendReleCommand } from '../../utils';

const ViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stone, setStone] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadRock = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getRockById(id);
        if (isActive) {
          setStone(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err.message || 'Камень не найден');
          setStone(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadRock();
      // Включаем подсветку для конкретного камня (позиция = ID камня)
      const rockId = parseInt(id, 10);
      if (rockId >= 1 && rockId <= 16) {
        sendReleCommand(rockId);
      }
    }

    return () => {
      isActive = false;
    };
  }, [id]);

  const descriptionLines = stone?.description ? stone.description.split('\n') : [];

  const renderContent = () => {
    if (loading) {
      return <p className={styles.status}>Загружаем информацию...</p>;
    }

    if (error || !stone) {
      return <p className={styles.status}>{error || 'Камень не найден'}</p>;
    }

    return (
      <div className={styles.blocksContainer}>
        <div className={styles.block1}>
          <div className={styles.block1Content}>{stone.name}</div>
        </div>

        <div className={styles.gallery}>
          <div
            className={styles.gallery_view}
            style={stone.image ? { backgroundImage: `url(${stone.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          ></div>

          {open ? (
            <button className={styles.gallery_button} onClick={() => setOpen(false)}>
              ОТКРЫТЬ 3D МОДЕЛЬ
            </button>
          ) : (
            <button className={styles.gallery_button} onClick={() => setOpen(true)}>
              ОТКРЫТЬ ОПИСАНИЕ
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {renderContent()}

      <button className={styles.backButton} onClick={() => navigate(-1)}>
        НАЗАД
      </button>

      {stone && open && (
        <div className={styles.overlay}>
          <div className={styles.panel}>
            <button className={styles.closeX} onClick={() => setOpen(false)}>
              ✕
            </button>

            <h3>{stone.name}</h3>
            {descriptionLines.map((line, idx) => (
              <p key={idx} style={{ marginTop: idx === 0 ? 0 : '30px' }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPage;
