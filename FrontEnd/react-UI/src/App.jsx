import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
    const [totalCustomers, setTotalCustomers] = useState(null);
    const [avgQueueLength, setAvgQueueLength] = useState(null);
    const [maxQueueLength, setMaxQueueLength] = useState(null);
    const [avgWaitTime, setAvgWaitTime] = useState(null);
    const [maxWaitTime, setMaxWaitTime] = useState(null);
    const [cashierUtilization, setCashierUtilization] = useState(null);
    const [throughput, setThroughput] = useState(null);
    const [logs, setLogs] = useState([]);
    const [queueLengths, setQueueLengths] = useState([]);

    const [duration, setDuration] = useState(60);
    const [numberOfCashiers, setNumberOfCashiers] = useState(1);
    const [arrivalRate, setArrivalRate] = useState(2);
    const [serviceTime, setServiceTime] = useState(5);
    const [basketBehavior, setBasketBehavior] = useState("normal");
    const [experimentData, setExperimentData] = useState([]);

    const [scenario, setScenario] = useState(null);
    const [scenarioResults, setScenarioResults] = useState([]);
    const [loading, setLoading] = useState(false);


    // Run single simulation
    const runSimulation = async () => {
        const url = `http://localhost:5000/run-simulation?duration=${duration}&cashiers=${numberOfCashiers}&arrival_rate=${arrivalRate}&service_time=${serviceTime}&basket_behavior=${basketBehavior}`;
        const res = await fetch(url);
        const data = await res.json();
        setTotalCustomers(data.customers_served);
        setAvgQueueLength(data.avg_queue_length);
        setMaxQueueLength(data.max_queue_length);
        setAvgWaitTime(data.avg_wait_time);
        setMaxWaitTime(data.max_wait_time);
        setCashierUtilization(data.cashier_utilization);
        setThroughput(data.throughput);
        setLogs(data.logs);
        setQueueLengths(data.queue_lengths.map((length, index) => ({ minute: index, queueLength: length })));
    };

    const runScenario = async (scenarioNumber) => {
        setScenario(scenarioNumber);
        setLoading(true);
        const res = await fetch(`http://localhost:5000/run-scenario?scenario=${scenarioNumber}`);
        const data = await res.json();
        setScenarioResults(data);
        setLoading(false);
    };


    return (
        <div className="container">
            <h1>Supermarket Queue Simulation</h1>

            {/* Simulation Inputs */}
            <div className="input-section">
                <div>
                    <label>
                        Simulation Duration (minutes):
                        <input type="number" value={duration} min="1" onChange={(e) => setDuration(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Number of Cashiers:
                        <input type="number" value={numberOfCashiers} min="1" onChange={(e) => setNumberOfCashiers(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Arrival Rate (minutes/customer):
                        <input type="number" value={arrivalRate} min="1" onChange={(e) => setArrivalRate(e.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Basket Behavior:
                        <select value={basketBehavior} onChange={(e) => setBasketBehavior(e.target.value)}>
                            <option value="normal">Normal</option>
                            <option value="seasonal">Seasonal</option>
                        </select>
                    </label>
                </div>
                <button onClick={runSimulation}>Run Simulation</button>
            </div>

            {/* Simulation Results */}
            {totalCustomers !== null && (
                <div className="simulation-results">
                    <h2>Simulation Results</h2>
                    <p>Total Customers Served: {totalCustomers}</p>
                    <p>Average Queue Length: {avgQueueLength.toFixed(2)}</p>
                    <p>Maximum Queue Length: {maxQueueLength}</p>
                    <p>Average Wait Time: {avgWaitTime.toFixed(2)} mins</p>
                    <p>Maximum Wait Time: {maxWaitTime.toFixed(2)} mins</p>
                    <p>Cashier Utilization: {cashierUtilization.toFixed(2)}%</p>
                    <p>Throughput: {throughput.toFixed(2)} items/min</p>
                </div>
            )}

            {/* Queue Length Over Time */}
            {queueLengths.length > 0 && (
                <div className="chart-container">
                    <h2>Queue Length Over Time</h2>
                    <ResponsiveContainer width="95%" height={300}>
                        <LineChart data={queueLengths} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="minute" label={{ value: "Time (minutes)", position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: "Queue Length", angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="queueLength" stroke="#8884d8" name="Queue Length" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Logs */}
            <div className="logs-box">
                {logs.map((line, i) => <div key={i}>{line}</div>)}
            </div>


        </div>
    );
}

export default App;
