import { Link } from 'react-router-dom';
import styles from './Card.module.scss';

const Card = ({ stone }) => {
    return (
        <Link to={`/stone/${stone.id}`} className={styles.card}>
            <div className={styles.glow}></div>
            <div className={styles.topBlock}>
                <div className={styles.image} style={{ backgroundImage: `url(${stone.image})` }} />
                <div className={styles.separator}></div>
            </div>
            <div className={styles.bottomBlock}>
                <span className={styles.title}>{stone.name}</span>
            </div>
        </Link>
    );
};

export default Card;
