# Simpybasics.py
import simpy

def hello_simpy(env):
    while True:
        print(f"Hello SimPy at time {env.now}")
        # Wait for 1 time unit
        yield env.timeout(1)

# Create a simulation environment
env = simpy.Environment()

# Start the hello_simpy process
env.process(hello_simpy(env))

# Run the simulation for 5 time units
env.run(until=5)
