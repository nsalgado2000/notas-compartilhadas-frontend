"use client";
import { useState, useEffect, useRef } from "react";
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
  const [notification, setNotification] = useState(null);

  // Snake Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: 1 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);

  const formRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  useEffect(() => {
    if (showForm && editingNota && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm, editingNota]);

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
      setTimeout(() => setLoading(false), 3000);
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
        showNotification("success", "TRANSMISSION UPDATED");
      } else {
        await axios.post(
          "https://notas-compartilhadas.onrender.com/api/notas",
          newNota
        );
        showNotification("success", "TRANSMISSION SENT");
      }

      setNewNota({ title: "", description: "" });
      setShowForm(false);
      setEditingNota(null);
      fetchNotas();
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      showNotification("error", "CONNECTION FAILED - UNABLE TO TRANSMIT");
    }
  };

  const deleteNota = async (id) => {
    try {
      await axios.delete(
        `https://notas-compartilhadas.onrender.com/api/notas/${id}`
      );

      showNotification("success", "TRANSMISSION DELETED");
      fetchNotas();
    } catch (error) {
      console.error("Erro ao deletar nota:", error);
      showNotification("error", "CONNECTION FAILED - UNABLE TO DELETE");
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
      <div
        className="loading-container"
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Courier New", monospace',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="static-overlay"></div>
        <div
          className="terminal-window"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            border: "1px solid #7877c6",
            minWidth: "600px",
            maxWidth: "700px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="terminal-header"
            style={{
              background: "linear-gradient(90deg, #1a1a1a, #2a2a2a)",
              color: "#7877c6",
              padding: "8px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              borderBottom: "1px solid #333",
            }}
          >
            <span className="terminal-dots" style={{ color: "#ff6b6b" }}>
              ● ● ●
            </span>
            <span className="terminal-title" style={{ color: "#7877c6" }}>
              CONNECTING TO THE WIRED...
            </span>
          </div>
          <div
            className="terminal-content"
            style={{
              padding: "30px",
              color: "#7877c6",
            }}
          >
            <div
              className="loading-text"
              style={{ textAlign: "center", marginBottom: "40px" }}
            >
              <div
                className="glitch-text"
                data-text="PRESENT DAY... PRESENT TIME..."
                style={{
                  fontSize: "16px",
                  position: "relative",
                  marginBottom: "20px",
                }}
              >
                PRESENT DAY... PRESENT TIME...
              </div>
              <div className="progress-container" style={{ marginTop: "20px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: "100%",
                    height: "2px",
                    background: "rgba(120, 119, 198, 0.2)",
                    marginBottom: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div className="progress-fill"></div>
                </div>
                <div
                  className="progress-text"
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  LOADING PROTOCOL 7...
                </div>
              </div>
            </div>

            <div
              className="snake-game"
              style={{ textAlign: "center", marginTop: "30px" }}
            >
              <div
                className="game-title"
                style={{
                  color: "#7877c6",
                  fontSize: "14px",
                  marginBottom: "15px",
                  letterSpacing: "2px",
                }}
              >
                NAVI SYSTEM
              </div>
              <div
                className="game-info"
                style={{
                  marginBottom: "20px",
                  fontSize: "11px",
                  color: "#666",
                }}
              >
                SCORE: {score} | STATUS:{" "}
                {gameRunning ? "ACTIVE" : "PRESS SPACE TO INITIALIZE"}
              </div>
              <div
                className="game-board"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${SNAKE_GAME_SIZE}, 1fr)`,
                  gap: "1px",
                  background: "#111",
                  border: "1px solid #333",
                  margin: "0 auto",
                  width: "300px",
                  height: "300px",
                }}
              >
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
                      style={{
                        background: isSnake
                          ? "#7877c6"
                          : isFood
                          ? "#ff77c6"
                          : "#000",
                        aspectRatio: "1",
                      }}
                    />
                  );
                })}
              </div>
              <div
                className="game-controls"
                style={{
                  marginTop: "20px",
                  fontSize: "10px",
                  color: "#444",
                  letterSpacing: "1px",
                }}
              >
                USE ARROW KEYS TO NAVIGATE THE WIRED
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", monospace;
            position: relative;
            overflow: hidden;
          }

          .static-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                circle at 20% 80%,
                rgba(120, 119, 198, 0.3) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 80% 20%,
                rgba(255, 119, 198, 0.15) 0%,
                transparent 50%
              ),
              radial-gradient(
                circle at 40% 40%,
                rgba(120, 119, 198, 0.1) 0%,
                transparent 50%
              );
            animation: static-noise 0.1s infinite;
            pointer-events: none;
            z-index: 1;
          }

          @keyframes static-noise {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }

          .terminal-window {
            background: rgba(0, 0, 0, 0.95);
            border: 1px solid #7877c6;
            box-shadow: 0 0 50px rgba(120, 119, 198, 0.3),
              inset 0 0 50px rgba(0, 0, 0, 0.5);
            min-width: 600px;
            max-width: 700px;
            position: relative;
            z-index: 2;
          }

          .terminal-header {
            background: linear-gradient(90deg, #1a1a1a, #2a2a2a);
            color: #7877c6;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            border-bottom: 1px solid #333;
          }

          .terminal-dots {
            color: #ff6b6b;
          }

          .terminal-title {
            color: #7877c6;
            font-weight: normal;
          }

          .terminal-content {
            padding: 30px;
            color: #7877c6;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(120, 119, 198, 0.03) 2px,
              rgba(120, 119, 198, 0.03) 4px
            );
          }

          .loading-text {
            text-align: center;
            margin-bottom: 40px;
          }

          .glitch-text {
            font-size: 16px;
            position: relative;
            animation: subtle-glitch 4s infinite;
            margin-bottom: 20px;
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
            animation: glitch-1 0.3s infinite;
            color: #ff77c6;
            z-index: -1;
          }

          .glitch-text::after {
            animation: glitch-2 0.3s infinite;
            color: #77c6ff;
            z-index: -2;
          }

          @keyframes subtle-glitch {
            0%,
            100% {
              transform: translate(0);
            }
            20% {
              transform: translate(-1px, 1px);
            }
            40% {
              transform: translate(-1px, -1px);
            }
            60% {
              transform: translate(1px, 1px);
            }
            80% {
              transform: translate(1px, -1px);
            }
          }

          @keyframes glitch-1 {
            0%,
            100% {
              transform: translate(0);
            }
            10% {
              transform: translate(-1px, -1px);
            }
            20% {
              transform: translate(1px, 1px);
            }
          }

          @keyframes glitch-2 {
            0%,
            100% {
              transform: translate(0);
            }
            30% {
              transform: translate(1px, -1px);
            }
            60% {
              transform: translate(-1px, 1px);
            }
          }

          .progress-container {
            margin-top: 20px;
          }

          .progress-bar {
            width: 100%;
            height: 2px;
            background: rgba(120, 119, 198, 0.2);
            border: none;
            margin-bottom: 10px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: #7877c6;
            animation: loading-progress 4s ease-in-out infinite;
          }

          @keyframes loading-progress {
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

          .progress-text {
            font-size: 12px;
            color: #666;
            text-align: center;
          }

          .snake-game {
            text-align: center;
            margin-top: 30px;
          }

          .game-title {
            color: #7877c6;
            font-size: 14px;
            margin-bottom: 15px;
            letter-spacing: 2px;
          }

          .game-info {
            margin-bottom: 20px;
            font-size: 11px;
            color: #666;
          }

          .game-board {
            display: grid;
            grid-template-columns: repeat(${SNAKE_GAME_SIZE}, 1fr);
            gap: 1px;
            background: #111;
            border: 1px solid #333;
            margin: 0 auto;
            width: 300px;
            height: 300px;
          }

          .game-cell {
            background: #000;
            aspect-ratio: 1;
          }

          .game-cell.snake {
            background: #7877c6;
            box-shadow: inset 0 0 3px rgba(120, 119, 198, 0.8);
          }

          .game-cell.food {
            background: #ff77c6;
            box-shadow: inset 0 0 3px rgba(255, 119, 198, 0.8);
          }

          .game-controls {
            margin-top: 20px;
            font-size: 10px;
            color: #444;
            letter-spacing: 1px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="lain-container">
      <div className="static-bg"></div>
      <div className="scan-lines"></div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "●" : "⚠"}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}

      <header className="lain-header">
        <div className="header-content">
          <div className="system-info">
            <span className="system-status">● CONNECTED</span>
            <span className="protocol">PROTOCOL 7</span>
          </div>
          <h1 className="main-title">
            <span className="title-glitch" data-text="THE WIRED">
              THE WIRED
            </span>
          </h1>
          <div className="subtitle">PRESENT DAY... PRESENT TIME...</div>
        </div>
      </header>

      <div className="main-content">
        <div className="control-panel">
          <button
            className="lain-button"
            onClick={() =>
              editingNota ? cancelEdit() : setShowForm(!showForm)
            }
          >
            {showForm ? "DISCONNECT" : "CONNECT"}
          </button>

          <div className="status-display">
            <span className="status-indicator">NAVI STATUS: ACTIVE</span>
          </div>
        </div>

        {showForm && (
          <div ref={formRef} className="input-terminal">
            <form onSubmit={createNota} className="terminal-form">
              <div className="input-group">
                <label>SUBJECT:</label>
                <input
                  type="text"
                  value={newNota.title}
                  onChange={(e) =>
                    setNewNota({ ...newNota, title: e.target.value })
                  }
                  className="terminal-input"
                  placeholder="Enter transmission subject..."
                  maxLength={50}
                />
              </div>

              <div className="input-group">
                <label>MESSAGE:</label>
                <textarea
                  value={newNota.description}
                  onChange={(e) =>
                    setNewNota({ ...newNota, description: e.target.value })
                  }
                  className="terminal-textarea"
                  placeholder="Transmit your thoughts to the wired..."
                  rows={4}
                  maxLength={500}
                />
              </div>

              <button type="submit" className="lain-button submit">
                {editingNota ? "UPDATE" : "TRANSMIT"}
              </button>
            </form>
          </div>
        )}

        <div className="message-grid">
          {notas.map((nota) => (
            <div
              key={nota._id}
              className="message-card"
              onClick={() => startEdit(nota)}
            >
              <div className="message-header">
                <span className="message-id">
                  ID: {nota._id.slice(-6).toUpperCase()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNota(nota._id);
                  }}
                  className="delete-button"
                  title="Delete transmission"
                >
                  ×
                </button>
              </div>

              <h3 className="message-title">{nota.title}</h3>
              <p className="message-content">{nota.description}</p>

              <div className="message-footer">
                <span className="timestamp">
                  TRANSMITTED:{" "}
                  {new Date().toLocaleDateString("en-US", {
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
          <div className="empty-wired">
            <div className="empty-message">
              <h2>NO SIGNAL DETECTED</h2>
              <p>The wired is silent. Be the first to transmit.</p>
            </div>
          </div>
        )}
      </div>

      <footer className="lain-footer">
        <div className="footer-content">
          <p>SERIAL EXPERIMENTS LAIN - LAYER 07</p>
          <p>CLOSE THE WORLD, OPEN THE NEXT</p>
        </div>
      </footer>

      <style jsx>{`
        .lain-container {
          min-height: 100vh;
          background: #000;
          color: #7877c6;
          font-family: "Courier New", monospace;
          position: relative;
          overflow-x: hidden;
        }

        .static-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(120, 119, 198, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(255, 119, 198, 0.05) 0%,
              transparent 50%
            );
          animation: static-movement 20s linear infinite;
          pointer-events: none;
          z-index: -2;
        }

        .scan-lines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(120, 119, 198, 0.03) 2px,
            rgba(120, 119, 198, 0.03) 4px
          );
          pointer-events: none;
          z-index: -1;
          animation: scan-lines-move 0.1s linear infinite;
        }

        @keyframes static-movement {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-50px) rotate(1deg);
          }
        }

        @keyframes scan-lines-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4px);
          }
        }

        .lain-header {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid #333;
          padding: 30px 20px;
          text-align: center;
          position: relative;
        }

        .system-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 20px;
          color: #666;
        }

        .system-status {
          color: #7877c6;
        }

        .main-title {
          font-size: 3rem;
          margin: 20px 0;
          font-weight: normal;
          letter-spacing: 8px;
        }

        .title-glitch {
          position: relative;
          animation: title-glitch 6s infinite;
        }

        .title-glitch::before,
        .title-glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .title-glitch::before {
          animation: glitch-1 0.4s infinite;
          color: #ff77c6;
          z-index: -1;
        }

        .title-glitch::after {
          animation: glitch-2 0.4s infinite;
          color: #77c6ff;
          z-index: -2;
        }

        @keyframes title-glitch {
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
          font-size: 14px;
          color: #666;
          letter-spacing: 2px;
          animation: fade-pulse 3s infinite;
        }

        @keyframes fade-pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .main-content {
          padding: 40px 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .control-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding: 20px 0;
          border-bottom: 1px solid #222;
        }

        .lain-button {
          background: transparent;
          border: 1px solid #7877c6;
          color: #7877c6;
          padding: 12px 30px;
          font-family: "Courier New", monospace;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
        }

        .lain-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(120, 119, 198, 0.1);
          transition: left 0.5s;
        }

        .lain-button:hover::before {
          left: 100%;
        }

        .lain-button:hover {
          box-shadow: 0 0 20px rgba(120, 119, 198, 0.3);
          color: #fff;
        }

        .lain-button.submit {
          border-color: #ff77c6;
          color: #ff77c6;
        }

        .lain-button.submit:hover {
          box-shadow: 0 0 20px rgba(255, 119, 198, 0.3);
        }

        .status-display {
          font-size: 11px;
          color: #666;
        }

        .status-indicator {
          color: #7877c6;
        }

        .input-terminal {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid #333;
          padding: 30px;
          margin-bottom: 40px;
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
        }

        .terminal-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          color: #7877c6;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .terminal-input,
        .terminal-textarea {
          background: transparent;
          border: none;
          border-bottom: 1px solid #333;
          color: #7877c6;
          padding: 10px 0;
          font-family: "Courier New", monospace;
          font-size: 13px;
          resize: vertical;
        }

        .terminal-input:focus,
        .terminal-textarea:focus {
          outline: none;
          border-bottom-color: #7877c6;
          box-shadow: 0 1px 0 0 rgba(120, 119, 198, 0.3);
        }

        .message-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .message-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid #222;
          padding: 25px;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.3);
        }

        .message-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(120, 119, 198, 0.05),
            transparent
          );
          transition: left 0.8s ease;
          pointer-events: none;
        }

        .message-card:hover::before {
          left: 100%;
        }

        .message-card:hover {
          border-color: #7877c6;
          box-shadow: 0 0 30px rgba(120, 119, 198, 0.1);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #222;
        }

        .message-id {
          font-size: 10px;
          color: #666;
          letter-spacing: 1px;
        }

        .delete-button {
          background: transparent;
          border: 1px solid #444;
          color: #666;
          padding: 4px 8px;
          cursor: pointer;
          font-family: "Courier New", monospace;
          transition: all 0.3s ease;
          font-size: 12px;
        }

        .delete-button:hover {
          border-color: #ff77c6;
          color: #ff77c6;
          box-shadow: 0 0 10px rgba(255, 119, 198, 0.3);
        }

        .message-title {
          color: #7877c6;
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: normal;
          letter-spacing: 1px;
        }

        .message-content {
          color: #999;
          line-height: 1.6;
          margin: 0 0 20px 0;
          font-size: 13px;
        }

        .message-footer {
          border-top: 1px solid #222;
          padding-top: 10px;
        }

        .timestamp {
          font-size: 10px;
          color: #555;
          letter-spacing: 1px;
        }

        .empty-wired {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-message h2 {
          color: #7877c6;
          font-size: 24px;
          margin-bottom: 20px;
          font-weight: normal;
          letter-spacing: 3px;
        }

        .empty-message p {
          color: #666;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .lain-footer {
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid #222;
          padding: 30px 20px;
          text-align: center;
        }

        .footer-content {
          color: #444;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .footer-content p {
          margin: 5px 0;
        }

        .notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          min-width: 300px;
          max-width: 500px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid;
          padding: 15px 20px;
          font-family: "Courier New", monospace;
          font-size: 12px;
          letter-spacing: 1px;
          animation: notification-slide-in 0.3s ease-out;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
        }

        .notification.success {
          border-color: #7877c6;
          color: #7877c6;
          box-shadow: 0 0 30px rgba(120, 119, 198, 0.3);
        }

        .notification.error {
          border-color: #ff77c6;
          color: #ff77c6;
          box-shadow: 0 0 30px rgba(255, 119, 198, 0.3);
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notification-icon {
          font-size: 14px;
          animation: notification-pulse 2s infinite;
        }

        .notification-message {
          flex: 1;
        }

        @keyframes notification-slide-in {
          0% {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes notification-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2rem;
            letter-spacing: 4px;
          }

          .control-panel {
            flex-direction: column;
            gap: 20px;
            align-items: stretch;
          }

          .message-grid {
            grid-template-columns: 1fr;
          }

          .system-info {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }

          .notification {
            min-width: 280px;
            max-width: 90vw;
            font-size: 11px;
            padding: 12px 15px;
          }
        }
      `}</style>
    </div>
  );
}
