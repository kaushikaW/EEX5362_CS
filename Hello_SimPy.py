import simpy

def hello_simpy(env):
    while True:
        print(f"Hello SimPy at time {env.now}")
        # Wait for 1 time unit
        yield env.timeout(1)

# Create the SimPy environment
env = simpy.Environment()

# Start the process
env.process(hello_simpy(env))

# Run the simulation for 10 time units
env.run(until=10)
