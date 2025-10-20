from flask import Flask, jsonify, request
from flask_cors import CORS
import simpy
import random
import io
import sys

app = Flask(__name__)
CORS(app)

# Simulation Parameters
ARRIVAL_RATE = 2
SERVICE_TIME = 5 # in minutes

def run_simulation(sim_duration):
    global SERVICE_TIME

    # Capture print() output
    buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buffer

    customers_served = 0

    def customer(env, name, cashier):
        nonlocal customers_served
        arrival_time = env.now
        print(f"{name} arrived at {arrival_time:.1f} mins")

        with cashier.request() as req:
            yield req
            wait_time = env.now - arrival_time
            yield env.timeout(SERVICE_TIME)
            customers_served += 1
            print(f"{name} served at {env.now:.1f} (Waited {wait_time:.1f} mins)")

    def customer_arrivals(env, cashier):
        i = 0
        while True:
            yield env.timeout(random.expovariate(1/ARRIVAL_RATE))
            i += 1
            env.process(customer(env, f"Customer {i}", cashier))

    # Run simulation
    env = simpy.Environment()
    cashier = simpy.Resource(env, capacity=1)
    env.process(customer_arrivals(env, cashier))
    env.run(until=sim_duration)

    print(f"\nTotal customers served in {sim_duration} minutes: {customers_served}")

    # Restore stdout
    sys.stdout = old_stdout

    return customers_served, buffer.getvalue().splitlines()


@app.route("/run-simulation", methods=["GET"])
def simulate():
    # Get duration from query param, default = 60
    duration = request.args.get("duration", default=60, type=float)
    total, logs = run_simulation(duration)
    return jsonify({"customers_served": total, "logs": logs})


if __name__ == "__main__":
    app.run(debug=True)
