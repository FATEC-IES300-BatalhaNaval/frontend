import React, { forwardRef } from 'react';
import styles from './Board.module.css';

const Board = forwardRef(({ grid = [], onCellClick, children, enableHover = false }, ref) => {

    const rows = ['', '1','2','3','4','5','6','7','8','9','10'];
    const cols = ['', 'A','B','C','D','E','F','G','H','I','J'];

    const getCellStatus = (x, y) => {
        const cell = grid.find(c => c.x === x && c.y === y);
        if (!cell) return null;

        if (cell.is_hit && cell.ship_id) return "hit";
        if (cell.is_hit) return "miss";

        return null;
    };

    return (
        <div className={`${styles.board} ${enableHover ? styles.enableHover : ''}`}>
            <div className={styles["board-background"]}>
                <div className={styles["board-table"]} ref={ref}>
                    
                    {[...Array(121)].map((_, i) => {
                        const x = (i % 11) - 1;
                        const y = Math.floor(i / 11) - 1;

                        const isLabel = i < 11 || i % 11 === 0;
                        const status = (!isLabel && getCellStatus(x, y)) || null;

                        return (
                            <div
                                key={i}
                                className={[
                                    styles.cell,
                                    status === "hit" && styles.hit,
                                    status === "miss" && styles.miss
                                ].filter(Boolean).join(' ')}
                                onClick={() => !isLabel && onCellClick?.(x, y)}
                            >
                                {isLabel && (
                                    <span className={styles.label}>
                                        {i < 11 ? cols[i] : rows[y + 1]}
                                    </span>
                                )}

                                {status === "hit" && (
                                    <div className={styles.explosion}></div>
                                )}
                            </div>
                        );
                    })}

                </div>
            </div>

            {children}
        </div>
    );
});

export default Board;
