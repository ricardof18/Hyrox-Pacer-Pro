import sys
import os
# Ensure the backend directory is in the path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app import pacer
    print("Import successful")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)

def test_scaling():
    target = "01:20:00"
    category = "Single Open"
    run_pace = "05:00"
    roxzone_min = 10.0
    
    print(f"Testing with Target: {target}, Run Pace: {run_pace}, Roxzone: {roxzone_min}min")
    
    try:
        result = pacer.calculate_splits(target, category, run_pace, roxzone_min)
        
        total_seconds = pacer.parse_time_to_seconds(target)
        roxzone_seconds = result['roxzone_total_seconds']
        splits_seconds = sum(s['suggested_time_seconds'] for s in result['splits'])
        
        actual_total = roxzone_seconds + splits_seconds
        
        print(f"Roxzone: {roxzone_seconds}s")
        print(f"Splits Sum: {splits_seconds}s")
        print(f"Calculated Total: {actual_total}s (Target: {total_seconds}s)")
        
        if actual_total == total_seconds:
            print("SUCCESS: Target exactly matched!")
        else:
            print(f"FAILURE: Offset by {actual_total - total_seconds}s")
            
        print("\nSplits:")
        for s in result['splits']:
            print(f"  {s['station']}: {s['suggested_time_formatted']}")
            
    except Exception as e:
        print(f"Error during calculation: {e}")

if __name__ == "__main__":
    test_scaling()
