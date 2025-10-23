import random
import simpy
import io
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Default Simulation Parameters
DEFAULT_ARRIVAL_RATE = 1      # customers per minute
DEFAULT_SERVICE_TIME = 5      # base service time per customer (mins)
DEFAULT_NUM_CASHIERS = 1      # number of cashiers
DEFAULT_SIM_DURATION = 60     # simulation time (mins)
DEFAULT_BASKET_BEHAVIOR = "normal"   # "normal" or "seasonal"


# -------------------- Basket Size Function --------------------
def get_basket_size(basket_behavior="normal"):
    # Returns a random basket size (number of items) based on shopping behavior:
    # "normal" -> mostly small/medium baskets, few large
    # "seasonal" -> more large baskets due to seasonal shopping
    # default/unknown -> uniform distribution

    if basket_behavior == "normal":
        sizes = list(range(1, 21))
        weights = [5]*5 + [4]*5 + [1]*10  # small:50%, medium:40%, large:10%
    elif basket_behavior == "seasonal":
        sizes = list(range(1, 21))
        weights = [2]*5 + [4]*5 + [4]*10  # small:20%, medium:40%, large:40%
    else:
        sizes = list(range(1, 21))
        weights = [1]*20  # uniform for unknown behavior
    return random.choices(sizes, weights=weights, k=1)[0]

# -------------------- Simulation Function --------------------
def run_simulation(sim_duration=DEFAULT_SIM_DURATION,
                   num_cashiers=DEFAULT_NUM_CASHIERS,
                   arrival_rate=DEFAULT_ARRIVAL_RATE,
                   base_service_time=DEFAULT_SERVICE_TIME,
                   basket_behavior=DEFAULT_BASKET_BEHAVIOR):

    buffer = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buffer

    customers_served = 0
    total_items_served = 0
    queue_lengths = []
    wait_times = []
    cashier_busy_time = [0.0] * num_cashiers  # Track busy time per cashier

    def customer(env, name, cashier):
        nonlocal customers_served, total_items_served
        arrival_time = env.now
        basket_size = get_basket_size(basket_behavior)
        service_time = base_service_time * (basket_size / 10.0)

        print(f"{name} arrived at {arrival_time:.1f} mins with {basket_size} items")

        with cashier.request() as req:
            yield req
            wait_time = env.now - arrival_time
            wait_times.append(wait_time)
            yield env.timeout(service_time)
            customers_served += 1
            total_items_served += basket_size
            # Track approximate cashier busy time (shared for simplicity)
            for i in range(num_cashiers):
                cashier_busy_time[i] += service_time / num_cashiers
            print(f"{name} served at {env.now:.1f} (Waited {wait_time:.1f} mins, Service {service_time:.1f} mins)")

    def customer_arrivals(env, cashier):
        i = 0
        while True:
            yield env.timeout(random.expovariate(1 / arrival_rate))
            i += 1
            env.process(customer(env, f"Customer {i}", cashier))

    def monitor_queue(env, cashier):
        while True:
            queue_lengths.append(len(cashier.queue))
            yield env.timeout(1)

    env = simpy.Environment()
    cashier = simpy.Resource(env, capacity=num_cashiers)
    env.process(customer_arrivals(env, cashier))
    env.process(monitor_queue(env, cashier))
    env.run(until=sim_duration)

    avg_queue_length = sum(queue_lengths) / len(queue_lengths) if queue_lengths else 0
    avg_wait_time = sum(wait_times) / len(wait_times) if wait_times else 0
    max_wait_time = max(wait_times) if wait_times else 0
    max_queue_length = max(queue_lengths) if queue_lengths else 0
    throughput = total_items_served / sim_duration
    utilization = sum(cashier_busy_time) / (num_cashiers * sim_duration) * 100

    print(f"\nTotal customers served in {sim_duration} minutes: {customers_served}")
    print(f"Total items served: {total_items_served}")
    print(f"Average queue length: {avg_queue_length:.2f}")
    print(f"Maximum queue length: {max_queue_length}")
    print(f"Average wait time: {avg_wait_time:.2f} mins")
    print(f"Maximum wait time: {max_wait_time:.2f} mins")
    print(f"Cashier utilization: {utilization:.2f}%")
    print(f"Throughput: {throughput:.2f} items per minute")

    sys.stdout = old_stdout

    return (customers_served, avg_queue_length, avg_wait_time, max_wait_time,
            max_queue_length, utilization, throughput, queue_lengths, buffer.getvalue().splitlines())

# -------------------- Flask Routes --------------------
@app.route("/run-simulation", methods=["GET"])
def simulate():
    duration = request.args.get("duration", default=DEFAULT_SIM_DURATION, type=float)
    cashiers = request.args.get("cashiers", default=DEFAULT_NUM_CASHIERS, type=int)
    arrival = request.args.get("arrival_rate", default=DEFAULT_ARRIVAL_RATE, type=float)
    service = request.args.get("service_time", default=DEFAULT_SERVICE_TIME, type=float)
    basket_behavior = request.args.get("basket_behavior", default=DEFAULT_BASKET_BEHAVIOR, type=str)

    (total, avg_q, avg_wait, max_wait,
     max_q, utilization, throughput, queue_lengths, logs) = run_simulation(
        sim_duration=duration,
        num_cashiers=cashiers,
        arrival_rate=arrival,
        base_service_time=service,
        basket_behavior=basket_behavior
    )

    return jsonify({
        "customers_served": total,
        "avg_queue_length": avg_q,
        "max_queue_length": max_q,
        "avg_wait_time": avg_wait,
        "max_wait_time": max_wait,
        "cashier_utilization": utilization,
        "throughput": throughput,
        "basket_behavior": basket_behavior,
        "logs": logs,
        "queue_lengths": queue_lengths   # <-- send to frontend
    })




if __name__ == "__main__":
    app.run(debug=True)
