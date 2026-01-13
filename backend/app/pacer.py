import datetime

def parse_time_to_seconds(time_str: str) -> int:
    try:
        if len(time_str.split(':')) == 2:
            # Handle MM:SS ? No, expecting HH:MM:SS as per prompt
            time_str = "00:" + time_str
        h, m, s = map(int, time_str.split(':'))
        return h * 3600 + m * 60 + s
    except ValueError:
        return 0

def format_seconds_to_time(seconds: int) -> str:
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    return "{:02d}:{:02d}:{:02d}".format(int(h), int(m), int(s))

def calculate_splits(target_time_str: str, category: str, preferred_run_pace: str = None, roxzone_minutes: float = None):
    total_seconds = parse_time_to_seconds(target_time_str)
    
    
    # 1. Base Weights & Station Setup
    # (Roxzone calculated after category check)


    stations = [
        {"name": "Run 1 (1km)", "type": "run", "weight": 0.90},
        {"name": "Ski Erg (1000m)", "type": "exercise", "weight": 1.0},
        {"name": "Run 2 (1km)", "type": "run", "weight": 0.92},
        {"name": "Sled Push (50m)", "type": "exercise", "weight": 0.9},
        {"name": "Run 3 (1km)", "type": "run", "weight": 0.95},
        {"name": "Sled Pull (50m)", "type": "exercise", "weight": 1.1},
        {"name": "Run 4 (1km)", "type": "run", "weight": 1.05},
        {"name": "Burpee Broad Jumps (80m)", "type": "exercise", "weight": 1.25},
        {"name": "Run 5 (1km)", "type": "run", "weight": 1.05},
        {"name": "Rowing (1000m)", "type": "exercise", "weight": 1.1},
        {"name": "Run 6 (1km)", "type": "run", "weight": 1.05},
        {"name": "Farmers Carry (200m)", "type": "exercise", "weight": 0.7},
        {"name": "Run 7 (1km)", "type": "run", "weight": 1.1},
        {"name": "Sandbag Lunges (100m)", "type": "exercise", "weight": 1.4},
        {"name": "Run 8 (1km)", "type": "run", "weight": 1.2},
        {"name": "Wall Balls (75/100)", "type": "exercise", "weight": 1.1},
    ]

    # Adjust weights based on Category
    # Categories: Single Open, Single Pro, Doubles Men, Doubles Pro
    cat_lower = category.lower()
    
    if "pro" in cat_lower:
        for s in stations:
            if s["type"] == "exercise":
                s["weight"] *= 1.15 # 15% harder exercises relative to run

    if "doubles" in cat_lower:
        for s in stations:
            if s["type"] == "exercise":
                s["weight"] *= 0.85 # 15% faster exercises for Doubles (split work)
    
    # Optional logic for Doubles? 
    # Usually doubles run faster (fresh legs) but exercises are shared (split).
    # If the calculator predicts for the TEAM, the exercise time might be halved (effectively fast), 
    # but the run is consistent. 
    # For now, we stick to the requested "Difficulty Factor" mainly on Pro.
    # If Doubles needs specific logic, we can add here.
    
    # Roxzone adjustment
    if roxzone_minutes is not None:
        roxzone_seconds = int(roxzone_minutes * 60)
    else:
        roxzone_factor = 0.08
        if "doubles" in cat_lower:
            roxzone_factor = 0.10 # 10% for Doubles
            # Tag Time: Add 5 seconds per station (8 stations) for transitions
            roxzone_seconds = (total_seconds * roxzone_factor) + (8 * 5)
        else:
            roxzone_seconds = total_seconds * roxzone_factor

    active_seconds = total_seconds - roxzone_seconds
    results = []
    warning_message = None

    if preferred_run_pace:
        run_pace_seconds = parse_time_to_seconds(preferred_run_pace)
        if run_pace_seconds == 0:
            raise ValueError("Invalid preferred run pace format (MM:SS)")
        
        # Calculate total run time (8 runs)
        # Note: We apply weights to runs too usually, but if user sets "Pace", is it Average Pace or Base Pace?
        # Let's assume it's the BASE pace (Run 1 equivalent) and we strictly adhere to it for the average, 
        # OR we scale it by fatigue? 
        # Requirement says: "fixar todas as 8 corridas de 1km com esse tempo".
        # So we fix ALL runs to this exact pace.
        
        fixed_run_time = run_pace_seconds
        total_run_time_needed = fixed_run_time * 8
        
        remaining_for_exercises = active_seconds - total_run_time_needed
        
        # Validation: Is there enough time?
        # Minimal viable exercise time check (very rough heuristic)
        # e.g. World record exercises total ~25-30 mins. Average ~40 mins.
        if remaining_for_exercises < (20 * 60): # Less than 20 mins for 8 exercises + roxzone adjustment?
             warning_message = f"Warning: High Intensity! Only {format_seconds_to_time(int(remaining_for_exercises))} remaining for exercises."
        
        if remaining_for_exercises <= 0:
             raise ValueError("Target time is impossible with this run pace! Reduce run pace or increase target time.")

        # Distribute remaining time among EXERCISES only
        exercise_stations = [s for s in stations if s["type"] == "exercise"]
        total_exercise_weight = sum(s["weight"] for s in exercise_stations)
        seconds_per_unit_exercise = remaining_for_exercises / total_exercise_weight

        current_sum = 0
        for i, s in enumerate(stations):
            if s["type"] == "run":
                station_time = fixed_run_time
            else:
                station_time = int(s["weight"] * seconds_per_unit_exercise)
            
            # Adjustment for last station to match target exactly
            if i == len(stations) - 1:
                station_time = active_seconds - current_sum

            current_sum += int(station_time)
            results.append({
                "station": s["name"],
                "type": s["type"],
                "suggested_time_seconds": int(station_time),
                "suggested_time_formatted": format_seconds_to_time(int(station_time))
            })

    else:
        # Standard weighted distribution
        total_weight = sum(s["weight"] for s in stations)
        seconds_per_unit = active_seconds / total_weight
        
        current_sum = 0
        for i, s in enumerate(stations):
            station_time = int(s["weight"] * seconds_per_unit)
            
            # Adjustment for last station
            if i == len(stations) - 1:
                station_time = active_seconds - current_sum

            current_sum += int(station_time)
            results.append({
                "station": s["name"],
                "type": s["type"],
                "suggested_time_seconds": int(station_time),
                "suggested_time_formatted": format_seconds_to_time(int(station_time))
            })
        
    return {
        "target_time": target_time_str,
        "roxzone_total_seconds": int(roxzone_seconds),
        "roxzone_formatted": format_seconds_to_time(int(roxzone_seconds)),
        "splits": results,
        "warning": warning_message
    }
