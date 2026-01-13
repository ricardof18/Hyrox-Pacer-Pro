import socket
import time

def check_port(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)
    try:
        s.connect(('127.0.0.1', port))
        return True
    except:
        return False
    finally:
        s.close()

if __name__ == "__main__":
    print(f"Checking port 8000: {'OPEN' if check_port(8000) else 'CLOSED'}")
