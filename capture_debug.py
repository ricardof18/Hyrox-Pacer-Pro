import subprocess
import os

def run_and_save(cmd, filename):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("STDOUT:\n")
            f.write(result.stdout)
            f.write("\nSTDERR:\n")
            f.write(result.stderr)
    except Exception as e:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"ERROR running command: {e}")

if __name__ == "__main__":
    run_and_save("docker-compose logs --tail=20 backend", "backend_debug_logs.txt")
    run_and_save("docker ps --format \"{{.Names}}: {{.Status}}\"", "docker_status.txt")
