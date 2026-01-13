
import requests
import json

def test_pacer():
    url = "http://localhost:8000/calculate-pacer"
    
    # Test case: Target 01:30:00, Pace 06:00
    # 6 mins/km * 8 = 48 mins running.
    # Total 90 mins.
    # We expect run splits to be EXACTLY 00:06:00
    
    payload = {
        "tempo_alvo": "01:30:00",
        "categoria_hyrox": "Open",
        "preferred_run_pace": "00:06:00"
    }
    
    try:
        print(f"Sending payload: {payload}")
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        print(f"Response status: {response.status_code}")
        
        splits = data.get('splits', [])
        run_splits = [s for s in splits if s['type'] == 'run']
        
        print(f"Found {len(run_splits)} run splits.")
        for i, r in enumerate(run_splits):
            print(f"Run {i+1}: {r['suggested_time_formatted']} (Seconds: {r['suggested_time_seconds']})")
            
        # Verify
        all_match = all(r['suggested_time_formatted'] == "00:06:00" for r in run_splits)
        if all_match:
            print("SUCCESS: All run splits match the preferred pace.")
        else:
            print("FAILURE: Some run splits do NOT match the preferred pace.")
            
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)

if __name__ == "__main__":
    test_pacer()
