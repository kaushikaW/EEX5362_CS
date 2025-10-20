import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [result, setResult] = useState(null);
    const [logs, setLogs] = useState([]);
    const [duration, setDuration] = useState(60); // default 60 minutes


    const runSimulation = async () => {
        const res = await fetch(`http://localhost:5000/run-simulation?duration=${duration}`);
        const data = await res.json();
        setResult(data.customers_served);
        setLogs(data.logs);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>SimPy Queue Simulation</h1>

            <div style={{ marginBottom: "10px" }}>
                <label>
                    Simulation Duration (minutes):&nbsp;
                    <input
                        type="number"
                        value={duration}
                        min="1"
                        onChange={(e) => setDuration(e.target.value)}
                        style={{ width: "80px" }}
                    />
                </label>
                <button onClick={runSimulation} style={{ marginLeft: "10px" }}>
                    Run Simulation
                </button>
            </div>

            {result !== null && <h2>Total Customers Served: {result}</h2>}

            <div style={{
                marginTop: "20px",
                background: "#111",
                color: "lightgreen",
                padding: "10px",
                fontFamily: "monospace",
                height: "300px",
                overflowY: "scroll",
                borderRadius: "5px"
            }}>
                {logs.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
}

export default App
