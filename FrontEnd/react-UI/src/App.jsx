import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

    const [duration, setDuration] = useState(60);
    const [numberOfCashiers, setNumberOfCashiers] = useState(1);
    const [arrivalRate, setArrivalRate] = useState(2);
    const [serviceTime, setServiceTime] = useState(5);
    const [basketBehavior, setBasketBehavior] = useState("normal");
    const [experimentData, setExperimentData] = useState([]);

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
    };

    const runExperiment = async () => {
        const url = `http://localhost:5000/run-experiment?basket_behavior=${basketBehavior}`;
        const res = await fetch(url);
        const data = await res.json();
        setExperimentData(data);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>SimPy Queue Simulation</h1>

            <div style={{ marginBottom: "10px" }}>
                <label>
                    Simulation Duration (minutes):&nbsp;
                    <input type="number" value={duration} min="1" onChange={(e) => setDuration(e.target.value)} style={{ width: "80px" }} />
                </label>
                <button onClick={runSimulation} style={{ marginLeft: "10px" }}>Run Simulation</button>
            </div>

            <div>
                <h2>Server (Cashier) Parameters</h2>
                <label>
                    Number of Cashiers:&nbsp;
                    <input type="number" value={numberOfCashiers} min="1" onChange={(e) => setNumberOfCashiers(e.target.value)} style={{ width: "80px" }} />
                </label>
            </div>

            <div>
                <h2>Arrival/Traffic Parameters</h2>
                <label>
                    Arrival Rate:&nbsp;
                    <input type="number" value={arrivalRate} min="1" onChange={(e) => setArrivalRate(e.target.value)} style={{ width: "80px" }} />
                </label>
            </div>

            <div>
                <h2>Basket Behavior</h2>
                <label>
                    Select Behavior:&nbsp;
                    <select value={basketBehavior} onChange={(e) => setBasketBehavior(e.target.value)}>
                        <option value="normal">Normal</option>
                        <option value="seasonal">Seasonal</option>
                    </select>
                </label>
            </div>

            {totalCustomers !== null && (
                <div style={{ marginTop: "20px" }}>
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

            <div>
                <button onClick={runExperiment} style={{ marginTop: "20px" }}>Run Experiment</button>
            </div>

            {experimentData.length > 0 && (
                <div style={{ marginTop: "40px" }}>
                    <h2>Experiment: Number of Cashiers vs Performance Metrics</h2>
                    <ResponsiveContainer width="95%" height={400}>
                        <BarChart data={experimentData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="cashiers" label={{ value: 'Number of Cashiers', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="customers_served" fill="#82ca9d" name="Customers Served" />
                            <Bar dataKey="avg_queue_length" fill="#8884d8" name="Avg Queue Length" />
                            <Bar dataKey="max_queue_length" fill="#ffc658" name="Max Queue Length" />
                            <Bar dataKey="cashier_utilization" fill="#ff8042" name="Cashier Utilization (%)" />
                            <Bar dataKey="throughput" fill="#00c49f" name="Throughput (items/min)" />
                        </BarChart>
                    </ResponsiveContainer>

                    <h3>Experiment Data Table</h3>
                    <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
                        <thead>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Cashiers</th>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Customers Served</th>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Avg Queue Length</th>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Max Queue Length</th>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Cashier Utilization (%)</th>
                            <th style={{ border: '1px solid black', padding: '5px' }}>Throughput (items/min)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {experimentData.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.cashiers}</td>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.customers_served}</td>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.avg_queue_length.toFixed(2)}</td>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.max_queue_length}</td>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.cashier_utilization.toFixed(2)}</td>
                                <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{row.throughput.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;
