.playContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 40px;
    padding: 20px;
    width: 100%;
}

.mainGameArea {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
}

.boardsContainer {
    display: flex;
    gap: 40px;
}

.boardWrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.buttonContainer {
    display: flex;
    gap: 32px; /* Ajusta o espaçamento entre os botões */
    width: 360px; /* Define a largura total igual à do tabuleiro */
    box-sizing: border-box; /* Garante que o padding não afete a largura total */
}

.randomizeButton {
    flex: 1; /* Permite que o botão cresça para preencher o espaço */
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    border: none;
    background-color: #036d9e;
    color: #FFF;
    text-align: center; /* Centraliza o texto no botão */
}

.confirmButton {
    flex: 1; /* Permite que o botão cresça para preencher o espaço */
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    border: none;
    background-color: #2ecc71; /* Verde */
    color: white;
    text-align: center; /* Centraliza o texto no botão */
}