import { useParams } from 'react-router-dom';
import stones from '../../data/stones';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ViewPage.module.scss';

const ViewPage = () => {
    const { id } = useParams();
    const stone = stones.find(s => s.id === Number(id));

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <div className={styles.blocksContainer}>
                <div className={styles.block1}>
                    <div className={styles.block1Content}>{stone.name}</div>
                </div>

                <div className={styles.gallery}>
                    <div className={styles.gallery_view}></div>

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

            <button className={styles.backButton} onClick={() => navigate(-1)}>
                НАЗАД
            </button>

            {open && (
                <div className={styles.overlay}>
                    <div className={styles.panel}>
                        <button className={styles.closeX} onClick={() => setOpen(false)}>
                            ✕
                        </button>

                        <h3>{stone.name}</h3>
                        {stone.description.split('\n').map((line, idx) => (
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
