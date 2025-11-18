import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Confetti from 'react-confetti';
import styles from './EndGameAnimation.module.css';

// Importa os arquivos de áudio de vitória e derrota
import winSound from '../../sound/sfx/win.wav';
import loseSound from '../../sound/sfx/lose.wav';

const EndGameAnimation = ({ result, onEnd }) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Toca o som correspondente ao resultado
    const soundToPlay = result === 'win' ? winSound : loseSound;
    new Audio(soundToPlay).play();
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    // Defina um tempo limite para remover o componente após a animação
    const timeout = setTimeout(() => {
      onEnd(); // Chama a função onEnd para remover o componente
    }, 5000); // Aumentamos o tempo para dar espaço para os confetes

    return () => {clearTimeout(timeout); window.removeEventListener('resize', handleResize);};
  }, [onEnd, result]);

  // Determine a mensagem e a imagem com base no resultado
  const message = result === 'win' ? 'Você venceu!' : 'Você perdeu!';
  const imageSrc = result === 'win' ? '/src/assets/endgame/vitoria.png' : '/src/assets/endgame/derrota.png';

  return (
    <div className={styles.endGameContainer}>
      {result === 'win' && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={400}
        />
      )}
      <h2 className={styles.message}>{message}</h2>
      <img src={imageSrc} alt={message} className={`${styles.animation} ${result === 'lose' ? styles.grayscaleAnimation : ''}`} />
    </div>
  );
};

EndGameAnimation.propTypes = {
  result: PropTypes.oneOf(['win', 'lose']).isRequired,
  onEnd: PropTypes.func.isRequired,
};

export default EndGameAnimation;