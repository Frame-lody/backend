import redis

try:
    # Replace 'localhost' and 6379 with your Redis server's address and port if different
    client = redis.StrictRedis(host='myredis', port=6379, db=0)

    # Check the connection
    response = client.ping()

    if response:
        print("Connected to Redis successfully!")
    else:
        print("Connection to Redis failed.")
except redis.ConnectionError as e:
    print(f"ConnectionError: {e}")
except Exception as e:
    print(f"Error: {e}")