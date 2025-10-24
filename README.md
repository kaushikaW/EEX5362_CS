# Supermarket Queue Simulation

This project simulates a supermarket queue system using the **SimPy** Python library for discrete-event simulation of customer arrivals, cashier service, and queue dynamics. The backend is built with **Flask** to provide an API for the simulation, while the frontend uses **React** to display interactive inputs, real-time metrics, and visualizations such as queue length and cashier utilization.

---

## Features

- **Frontend**: Built with React, featuring interactive inputs and real-time data visualization using `recharts`.
- **Backend**: Powered by Flask, simulating queue behavior using the `simpy` library.
- **Simulation Metrics**:
    - Total customers served
    - Average and maximum queue length
    - Average and maximum wait time
    - Cashier utilization
    - Throughput (items per minute)
- **Charts**: Visualize queue length over time.
- **Logs**: Detailed logs of customer arrivals and service.

---

## Technologies Used

### Frontend
- **React**
- **Recharts** for data visualization
- **CSS** for styling

### Backend
- **Python**
- **Flask** for API
- **SimPy** for simulation
- **Flask-CORS** for cross-origin requests

---

## Installation

### Prerequisites
- **Node.js** and **npm** for the frontend
- **Python 3.8+** for the backend

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>

### Frontend Setup:

```
cd FrontEnd/react-UI
npm install
npm start
```

### Backend Setup:


``` 
cd simpy-backend
pip install -r requirements.txt
python Simulation.py 
```

### Access the Application:


Frontend: http://localhost:3000
Backend: http://localhost:5000


### Usage
Run a Simulation:


- Input parameters like simulation duration, number of cashiers, arrival rate, etc.
- Click "Run Simulation" to start.
- View Results:


- Check metrics like average wait time, queue length, and cashier utilization.
- View the queue length chart and logs.