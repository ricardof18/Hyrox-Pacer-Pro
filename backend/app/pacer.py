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

import json
import os

def load_benchmarks():
    data_path = os.path.join(os.path.dirname(__file__), "data", "hyrox_benchmarks.json")
    try:
        with open(data_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading benchmarks: {e}")
        return {}

def calculate_splits(target_time_str: str, category: str, preferred_run_pace: str = None, roxzone_minutes: float = None, is_elite: bool = False, athlete_level: str = "Competitivo"):
    # 1. Initialization
    total_seconds = parse_time_to_seconds(target_time_str)
    cat_lower = category.lower()
    level_lower = athlete_level.lower()
    benchmarks_data = load_benchmarks()

    # 2. Category Mapping to Benchmark Keys
    bench_key = "OPEN_M"
    if "pro" in cat_lower:
        bench_key = "PRO_M"
    elif "doubles" in cat_lower:
        # If it's Doubles Pro, we could use PRO_M or a hybrid. 
        # Requirement usually implies DOUBLES_M for general doubles.
        # User specified DOUBLES_M in the JSON.
        bench_key = "DOUBLES_M" if "pro" not in cat_lower else "PRO_M"
    
    bench = benchmarks_data.get(bench_key, benchmarks_data.get("OPEN_M"))
    
    # 3. Reference Values
    bench_run_base = bench.get("run_base", 300) # seconds
    user_run_pace_seconds = parse_time_to_seconds(preferred_run_pace) if preferred_run_pace else (total_seconds // 16) # Heuristic if none
    
    # Ratio Calculation
    pace_ratio = user_run_pace_seconds / bench_run_base

    # 4. Station Definitions & Proportional Calculation
    # Based on: Tempo_Previsto = Benchmark_Estação * (Pace_Corrida_Utilizador / Run_Base_Categoria)
    stations_config = [
        {"name": "Run 1 (1km)", "type": "run", "key": None},
        {"name": "Ski Erg (1000m)", "type": "exercise", "key": "ski"},
        {"name": "Run 2 (1km)", "type": "run", "key": None},
        {"name": "Sled Push (50m)", "type": "exercise", "key": "sled_push"},
        {"name": "Run 3 (1km)", "type": "run", "key": None},
        {"name": "Sled Pull (50m)", "type": "exercise", "key": "sled_pull"},
        {"name": "Run 4 (1km)", "type": "run", "key": None},
        {"name": "Burpee Broad Jumps (80m)", "type": "exercise", "key": "burpees"},
        {"name": "Run 5 (1km)", "type": "run", "key": None},
        {"name": "Rowing (1000m)", "type": "exercise", "key": "row"},
        {"name": "Run 6 (1km)", "type": "run", "key": None},
        {"name": "Farmers Carry (200m)", "type": "exercise", "key": "farmers"},
        {"name": "Run 7 (1km)", "type": "run", "key": None},
        {"name": "Sandbag Lunges (100m)", "type": "exercise", "key": "lunges"},
        {"name": "Run 8 (1km)", "type": "run", "key": None},
        {"name": "Wall Balls (75/100)", "type": "exercise", "key": "wall_balls"},
    ]

    # 5. Fatigue Logic (1.02 cumulative after 2nd station)
    fatigue_base = 1.02
    if level_lower == "elite" or is_elite:
        fatigue_base = 1.01 # Elite has better recovery
    
    # 6. Hard Caps (Ski 170s, Burpees 190s)
    # Elite bypasses limits
    bypass_limits = (level_lower == "elite" or is_elite)

    results = []
    exercise_count = 0
    calculated_sum = 0
    
    # Roxzone Calc
    if roxzone_minutes and roxzone_minutes > 0:
        roxzone_seconds = int(roxzone_minutes * 60)
    else:
        # Defaults
        roxzone_seconds = int(total_seconds * (0.10 if "doubles" in cat_lower else 0.08))
        if "doubles" in cat_lower:
            roxzone_seconds += 40 # Tag transitions

    for s in stations_config:
        if s["type"] == "run":
            station_time = user_run_pace_seconds
        else:
            exercise_count += 1
            bench_val = bench.get(s["key"], 300)
            
            # Base Proportional
            station_time = bench_val * pace_ratio
            
            # Fatigue: Multiplicador de 1.02 (acumulativo) a cada estação após a segunda.
            if exercise_count > 2:
                fatigue_multiplier = fatigue_base ** (exercise_count - 2)
                station_time *= fatigue_multiplier
            
            # Athlete Level Adjustments
            if level_lower == "recreativo":
                # Recreativo takes 15% longer on strength (non-ergs)
                if s["key"] not in ["ski", "row"]:
                    station_time *= 1.15

            # Hard Caps (Ski 170s, Burpees 190s)
            if not bypass_limits:
                if s["key"] == "ski":
                    station_time = max(station_time, 170)
                if s["key"] == "burpees":
                    station_time = max(station_time, 190)

        calculated_sum += int(station_time)
        results.append({
            "station": s["name"],
            "type": s["type"],
            "suggested_time_seconds": int(station_time),
            "suggested_time_formatted": format_seconds_to_time(int(station_time))[3:] # MM:SS
        })

    # Add pace per 500m for Ergs
    for r in results:
        if "Ski" in r["station"] or "Row" in r["station"]:
            pace_seconds = r["suggested_time_seconds"] / 2
            r["pace_per_500m"] = format_seconds_to_time(int(pace_seconds))[3:]

    # Final Adjustment to meet Target Time (adjusting exercises if needed)
    actual_total = calculated_sum + roxzone_seconds
    diff = total_seconds - actual_total
    
    # We apply the difference to non-cap-bound exercise stations to maintain realism
    if abs(diff) > 5:
        adj_targets = [r for r in results if r["type"] == "exercise" and "Ski" not in r["station"] and "Burpee" not in r["station"]]
        if adj_targets:
            per_station_adj = diff // len(adj_targets)
            for r in adj_targets:
                r["suggested_time_seconds"] += int(per_station_adj)
                r["suggested_time_formatted"] = format_seconds_to_time(int(r["suggested_time_seconds"]))[3:]

    return {
        "target_time": target_time_str,
        "roxzone_total_seconds": int(roxzone_seconds),
        "roxzone_formatted": format_seconds_to_time(int(roxzone_seconds))[3:],
        "splits": results,
        "athlete_level": athlete_level,
        "bench_category": bench_key
    }
