import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../card/Card';
import styles from './HomePage.module.scss';
import { getRocks } from '../../api/rocksApi';
import { sendReleCommand } from '../../utils';

const HomePage = () => {
    const navigate = useNavigate();
    const [rocks, setRocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRocks = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getRocks();
            setRocks(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRocks();
        // В главном меню включаем общую подсветку (позиция 17)
        sendReleCommand(17);
    }, [loadRocks]);

    const hasRocks = rocks.length > 0;

    return (
        <div className={styles.wrapper}>
            <img src="/images/logo.svg" alt="Logo" className={styles.logo} />

            <div className={styles.contentBlock}>
                <h1 className={styles.title}>
                    ВЫБЕРИТЕ ОБРАЗЕЦ,
                    <br />
                    ЧТОБЫ УЗНАТЬ БОЛЬШЕ
                </h1>

                {loading && <p className={styles.status}>Загружаем коллекцию...</p>}

                {!loading && error && (
                    <div className={styles.status}>
                        <p>{error}</p>
                        <button type="button" className={styles.retryButton} onClick={loadRocks}>
                            Повторить попытку
                        </button>
                    </div>
                )}

                {!loading && !error && !hasRocks && (
                    <p className={styles.status}>Камней пока нет. Добавьте их в админке.</p>
                )}

                {!loading && !error && hasRocks && (
                    <div className={styles.grid}>
                        {rocks.map((stone, index) => (
                            <Card key={stone.id} stone={stone} index={index} />
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    НАЗАД
                </button>
            </div>
        </div>
    );
};

export default HomePage;
