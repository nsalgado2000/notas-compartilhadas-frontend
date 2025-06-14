"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const SNAKE_GAME_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_FOOD = { x: 5, y: 5 };

export default function Home() {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNota, setNewNota] = useState({ title: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingNota, setEditingNota] = useState(null);

  // Snake Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: 1 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchNotas();
  }, []);

  useEffect(() => {
    if (!loading) return;

    const handleKeyPress = (e) => {
      if (!gameRunning) {
        if (e.key === " ") {
          setGameRunning(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameRunning, loading]);

  useEffect(() => {
    if (!gameRunning || !loading) return;

    const gameInterval = setInterval(() => {
      setSnake((currentSnake) => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        if (
          head.x < 0 ||
          head.x >= SNAKE_GAME_SIZE ||
          head.y < 0 ||
          head.y >= SNAKE_GAME_SIZE
        ) {
          setGameRunning(false);
          return INITIAL_SNAKE;
        }

        if (
          newSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setGameRunning(false);
          return INITIAL_SNAKE;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood({
            x: Math.floor(Math.random() * SNAKE_GAME_SIZE),
            y: Math.floor(Math.random() * SNAKE_GAME_SIZE),
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 200);

    return () => clearInterval(gameInterval);
  }, [direction, food, gameRunning, loading]);

  const fetchNotas = async () => {
    try {
      const response = await axios.get(
        "https://notas-compartilhadas.onrender.com/api/notas"
      );
      setNotas(response.data);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const createNota = async (e) => {
    e.preventDefault();
    if (!newNota.title.trim() || !newNota.description.trim()) return;

    try {
      if (editingNota) {
        await axios.put(
          `https://notas-compartilhadas.onrender.com/api/notas/${editingNota._id}`,
          newNota
        );
      } else {
        await axios.post(
          "https://notas-compartilhadas.onrender.com/api/notas",
          newNota
        );
      }

      setNewNota({ title: "", description: "" });
      setShowForm(false);
      setEditingNota(null);
      fetchNotas();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    }
  };

  const deleteNota = async (id) => {
    try {
      await axios.delete(
        `https://notas-compartilhadas.onrender.com/api/notas/${id}`
      );

      fetchNotas();
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
    }
  };

  const startEdit = (nota) => {
    setNewNota({ title: nota.title, description: nota.description });
    setEditingNota(nota);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setNewNota({ title: "", description: "" });
    setEditingNota(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="crt-effect">
          <div className="terminal-window">
            <div className="terminal-header">
              <span>◉ ◉ ◉</span>
              <span>CARREGANDO CIBERESPAÇO...</span>
            </div>
            <div className="terminal-content">
              <div className="loading-text">
                <div className="glitch" data-text="ACESSANDO REDE NEURAL...">
                  ACESSANDO REDE NEURAL...
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>

              <div className="snake-game">
                <h3>🐍 CYBER COBRA 2000 🐍</h3>
                <div className="game-info">
                  Pontos: {score} |{" "}
                  {gameRunning ? "JOGANDO" : "PRESSIONE ESPAÇO PARA INICIAR"}
                </div>
                <div className="game-board">
                  {Array.from({
                    length: SNAKE_GAME_SIZE * SNAKE_GAME_SIZE,
                  }).map((_, index) => {
                    const x = index % SNAKE_GAME_SIZE;
                    const y = Math.floor(index / SNAKE_GAME_SIZE);
                    const isSnake = snake.some(
                      (segment) => segment.x === x && segment.y === y
                    );
                    const isFood = food.x === x && food.y === y;

                    return (
                      <div
                        key={index}
                        className={`game-cell ${isSnake ? "snake" : ""} ${
                          isFood ? "food" : ""
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="game-controls">
                  Use as setas para mover • Espaço para iniciar
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            background: linear-gradient(45deg, #000428, #004e92);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", monospace;
            overflow: hidden;
          }

          .crt-effect {
            position: relative;
            background: radial-gradient(
              ellipse at center,
              rgba(0, 255, 0, 0.1) 0%,
              transparent 70%
            );
          }

          .crt-effect::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 0, 0.03) 2px,
              rgba(0, 255, 0, 0.03) 4px
            );
            pointer-events: none;
            animation: scanlines 0.1s linear infinite;
          }

          @keyframes scanlines {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(4px);
            }
          }

          .terminal-window {
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
            min-width: 500px;
            max-width: 600px;
          }

          .terminal-header {
            background: linear-gradient(90deg, #00ff00, #00cc00);
            color: black;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 12px;
          }

          .terminal-content {
            padding: 20px;
            color: #00ff00;
          }

          .loading-text {
            text-align: center;
            margin-bottom: 30px;
          }

          .glitch {
            font-size: 18px;
            font-weight: bold;
            position: relative;
            animation: glitch 2s infinite;
          }

          .glitch::before,
          .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .glitch::before {
            animation: glitch-1 0.5s infinite;
            color: #ff0000;
            z-index: -1;
          }

          .glitch::after {
            animation: glitch-2 0.5s infinite;
            color: #0000ff;
            z-index: -2;
          }

          @keyframes glitch {
            0%,
            100% {
              transform: translate(0);
            }
            20% {
              transform: translate(-2px, 2px);
            }
            40% {
              transform: translate(-2px, -2px);
            }
            60% {
              transform: translate(2px, 2px);
            }
            80% {
              transform: translate(2px, -2px);
            }
          }

          @keyframes glitch-1 {
            0%,
            100% {
              transform: translate(0);
            }
            10% {
              transform: translate(-2px, -2px);
            }
            20% {
              transform: translate(2px, 2px);
            }
          }

          @keyframes glitch-2 {
            0%,
            100% {
              transform: translate(0);
            }
            30% {
              transform: translate(2px, -2px);
            }
            60% {
              transform: translate(-2px, 2px);
            }
          }

          .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(0, 255, 0, 0.2);
            border: 1px solid #00ff00;
            margin-top: 15px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff00, #00cc00);
            animation: loading 3s ease-in-out infinite;
          }

          @keyframes loading {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }

          .snake-game {
            text-align: center;
            margin-top: 20px;
          }

          .snake-game h3 {
            color: #ff00ff;
            text-shadow: 0 0 10px #ff00ff;
            margin-bottom: 10px;
          }

          .game-info {
            margin-bottom: 15px;
            font-size: 14px;
          }

          .game-board {
            display: grid;
            grid-template-columns: repeat(${SNAKE_GAME_SIZE}, 1fr);
            gap: 1px;
            background: #333;
            border: 2px solid #00ff00;
            margin: 0 auto;
            width: 300px;
            height: 300px;
          }

          .game-cell {
            background: #000;
            aspect-ratio: 1;
          }

          .game-cell.snake {
            background: #00ff00;
            box-shadow: inset 0 0 5px rgba(0, 255, 0, 0.8);
          }

          .game-cell.food {
            background: #ff0000;
            box-shadow: inset 0 0 5px rgba(255, 0, 0, 0.8);
          }

          .game-controls {
            margin-top: 15px;
            font-size: 12px;
            color: #888;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cyber-container">
      <div className="matrix-bg"></div>

      <header className="cyber-header">
        <div className="header-content">
          <h1 className="cyber-title">
            <span className="glitch-text" data-text="◊ CYBER MURAL 2000 ◊">
              ◊ CYBER MURAL 2000 ◊
            </span>
          </h1>
          <div className="subtitle">
            ★ REDE NEURAL COMPARTILHADA ★ DEIXE SUA MARCA ★
          </div>
        </div>

        <div className="visitor-counter">
          <img
            src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wjRLEuQRNnGt7QpVdNhHJBkaIrdoyiiRWAER+qD7YrDNkFxM8s5W2W+kSgwAAIfkECQoAAAAsAAAAABAAEAAAAzQIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wjRLEuQRNnGt7QpVdNhHJBkaIrdoyiiRWAER+qD7YrDNkFxM8s5W2W+kSgwAAOw=="
            alt="Carregando..."
          />
          VISITANTES: {Math.floor(Math.random() * 9999) + 1000}
        </div>
      </header>

      <div className="main-content">
        <div className="action-bar">
          <button
            className="cyber-button add-btn"
            onClick={() =>
              editingNota ? cancelEdit() : setShowForm(!showForm)
            }
          >
            {showForm ? "✖ CANCELAR" : "+ ADICIONAR MENSAGEM"}
          </button>

          <div className="status-bar">
            <span className="blink">● ONLINE</span>
            <span>LINK NEURAL ATIVO</span>
          </div>
        </div>

        {showForm && (
          <div className="form-container">
            <form onSubmit={createNota} className="cyber-form">
              <div className="form-group">
                <label>ASSUNTO:</label>
                <input
                  type="text"
                  value={newNota.title}
                  onChange={(e) =>
                    setNewNota({ ...newNota, title: e.target.value })
                  }
                  className="cyber-input"
                  placeholder={
                    editingNota
                      ? "Edite o título da transmissão..."
                      : "Digite o título da transmissão..."
                  }
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label>MENSAGEM:</label>
                <textarea
                  value={newNota.description}
                  onChange={(e) =>
                    setNewNota({ ...newNota, description: e.target.value })
                  }
                  className="cyber-textarea"
                  placeholder={
                    editingNota
                      ? "Edite sua mensagem..."
                      : "Transmita sua mensagem para a rede..."
                  }
                  rows={4}
                  maxLength={500}
                />
              </div>

              <button type="submit" className="cyber-button submit-btn">
                {editingNota ? "⚡ ATUALIZAR ⚡" : "⚡ TRANSMITIR ⚡"}
              </button>
            </form>
          </div>
        )}

        <div className="notes-grid">
          {notas.map((nota) => (
            <div
              key={nota._id}
              className="note-card"
              onClick={() => startEdit(nota)}
            >
              <div className="note-header">
                <span className="note-id">
                  #{nota._id.slice(-6).toUpperCase()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNota(nota._id);
                  }}
                  className="delete-btn"
                  title="Deletar transmissão"
                >
                  ✖
                </button>
              </div>

              <h3 className="note-title">{nota.title}</h3>
              <p className="note-description">{nota.description}</p>

              <div className="note-footer">
                <span className="timestamp">
                  TRANSMITIDO:{" "}
                  {new Date().toLocaleDateString("pt-BR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {notas.length === 0 && (
          <div className="empty-state">
            <div className="empty-message">
              <h2>◊ REDE NEURAL VAZIA ◊</h2>
              <p>
                Nenhuma transmissão detectada. Seja o primeiro a deixar sua
                marca!
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="cyber-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>◊ CYBER MURAL 2000 ◊ INTERFACE DE REDE NEURAL v2.1</p>
            <p>MELHOR VISUALIZADO NO NETSCAPE NAVIGATOR 4.0+</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .cyber-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0a0a0a 0%,
            #1a1a2e 50%,
            #16213e 100%
          );
          color: #00ff00;
          font-family: "Courier New", monospace;
          position: relative;
          overflow-x: hidden;
        }

        .matrix-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(
              circle at 25% 25%,
              rgba(0, 255, 0, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 75% 75%,
              rgba(0, 255, 255, 0.1) 0%,
              transparent 50%
            );
          animation: matrix-flow 20s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes matrix-flow {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
          }
        }

        .cyber-header {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.9),
            rgba(0, 255, 0, 0.1),
            rgba(0, 0, 0, 0.9)
          );
          border-bottom: 2px solid #00ff00;
          padding: 20px;
          text-align: center;
          position: relative;
        }

        .cyber-header::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.1) 2px,
            rgba(0, 255, 0, 0.1) 4px
          );
          pointer-events: none;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .cyber-title {
          font-size: 2.5rem;
          margin: 0;
          text-shadow: 0 0 20px #00ff00;
          position: relative;
        }

        .glitch-text {
          position: relative;
          animation: glitch-title 3s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          animation: glitch-1 0.5s infinite;
          color: #ff0080;
          z-index: -1;
        }

        .glitch-text::after {
          animation: glitch-2 0.5s infinite;
          color: #0080ff;
          z-index: -2;
        }

        @keyframes glitch-title {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        .subtitle {
          font-size: 1rem;
          margin-top: 10px;
          color: #ff00ff;
          text-shadow: 0 0 10px #ff00ff;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .visitor-counter {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #00ff00;
          padding: 5px 10px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .visitor-counter img {
          width: 16px;
          height: 16px;
        }

        .main-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .cyber-button {
          background: linear-gradient(45deg, #000, #333);
          border: 2px solid #00ff00;
          color: #00ff00;
          padding: 12px 24px;
          font-family: "Courier New", monospace;
          font-weight: bold;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .cyber-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .cyber-button:hover::before {
          left: 100%;
        }

        .cyber-button:hover {
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
          transform: translateY(-2px);
        }

        .add-btn {
          background: linear-gradient(45deg, #001100, #003300);
        }

        .submit-btn {
          background: linear-gradient(45deg, #110011, #330033);
          border-color: #ff00ff;
          color: #ff00ff;
        }

        .submit-btn:hover {
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }

        .status-bar {
          display: flex;
          gap: 20px;
          font-size: 14px;
        }

        .blink {
          animation: blink 1s infinite;
          color: #3eff00;
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }

        .form-container {
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #00ff00;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
        }

        .cyber-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #00ff00;
          font-weight: bold;
          text-transform: uppercase;
        }

        .cyber-input,
        .cyber-textarea {
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 12px;
          font-family: "Courier New", monospace;
          font-size: 14px;
          resize: vertical;
        }

        .cyber-input:focus,
        .cyber-textarea:focus {
          outline: none;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
          border-color: #00ffff;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .note-card {
          background: linear-gradient(
            135deg,
            rgba(0, 0, 0, 0.9),
            rgba(0, 50, 0, 0.3)
          );
          border: 2px solid #00ff00;
          padding: 20px;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          cursor: pointer;
        }

        .note-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.1),
            transparent
          );
          transition: left 0.6s ease;
          z-index: 1;
          pointer-events: none;
        }

        .note-card:hover::before {
          left: 100%;
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(0, 255, 0, 0.4);
          border-color: #00ffff;
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
        }

        .note-id {
          background: rgba(0, 255, 0, 0.2);
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid #00ff00;
          color: #00ff00;
        }

        .delete-btn {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff0000;
          color: #ff0000;
          padding: 4px 8px;
          cursor: pointer;
          font-family: "Courier New", monospace;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background: rgba(255, 0, 0, 0.4);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .note-title {
          color: #00ffff;
          margin: 0 0 15px 0;
          font-size: 1.2rem;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .note-description {
          color: #cccccc;
          line-height: 1.6;
          margin: 0 0 15px 0;
          word-wrap: break-word;
        }

        .note-footer {
          border-top: 1px solid rgba(0, 255, 0, 0.3);
          padding-top: 10px;
        }

        .timestamp {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-message h2 {
          color: #ff00ff;
          font-size: 2rem;
          margin-bottom: 20px;
          text-shadow: 0 0 15px #ff00ff;
        }

        .empty-message p {
          color: #888;
          font-size: 1.1rem;
        }

        .cyber-footer {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.9),
            rgba(0, 255, 0, 0.1),
            rgba(0, 0, 0, 0.9)
          );
          border-top: 2px solid #00ff00;
          padding: 30px 20px;
          margin-top: 40px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .footer-link {
          color: #00ff00;
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid #00ff00;
          transition: all 0.3s ease;
          text-transform: uppercase;
          font-weight: bold;
        }

        .footer-link:hover {
          background: rgba(0, 255, 0, 0.2);
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        }

        .footer-info {
          color: #888;
          font-size: 12px;
        }

        .footer-info p {
          margin: 5px 0;
        }

        @media (max-width: 768px) {
          .cyber-title {
            font-size: 1.8rem;
          }

          .action-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .status-bar {
            justify-content: center;
          }

          .notes-grid {
            grid-template-columns: 1fr;
          }

          .visitor-counter {
            position: static;
            margin-top: 15px;
            align-self: center;
          }

          .footer-links {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}
