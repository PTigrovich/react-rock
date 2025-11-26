import React from 'react';
import stones from '../../data/stones';
import Card from '../card/Card';
import styles from './HomePage.module.scss';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            {/* Логотип */}
            <img src="/images/logo.svg" alt="Logo" className={styles.logo} />

            {/* Общий блок: заголовок + сетка */}
            <div className={styles.contentBlock}>
                {/* Заголовок */}
                <h1 className={styles.title}>
                    ВЫБЕРИТЕ ОБРАЗЕЦ,
                    <br />
                    ЧТОБЫ УЗНАТЬ БОЛЬШЕ
                </h1>

                {/* Сетка карточек */}
                <div className={styles.grid}>
                    {stones.map((stone, index) => (
                        <Card key={stone.id} stone={stone} index={index} />
                    ))}
                </div>
            </div>

            {/* Кнопка НАЗАД */}
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                НАЗАД
            </button>
        </div>
    );
};

export default HomePage;
