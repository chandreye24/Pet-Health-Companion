"""
Geolocation utilities for distance calculations
"""
import math
from typing import Tuple


def haversine_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    """
    Calculate the great circle distance between two points on Earth
    using the Haversine formula
    
    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point
    
    Returns:
        float: Distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    
    return round(distance, 2)


def is_within_radius(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    radius_km: float
) -> bool:
    """
    Check if two points are within a specified radius
    
    Args:
        lat1: Latitude of first point
        lon1: Longitude of first point
        lat2: Latitude of second point
        lon2: Longitude of second point
        radius_km: Radius in kilometers
    
    Returns:
        bool: True if within radius, False otherwise
    """
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    return distance <= radius_km


def get_bounding_box(
    lat: float,
    lon: float,
    radius_km: float
) -> Tuple[float, float, float, float]:
    """
    Calculate bounding box coordinates for a given point and radius
    
    Args:
        lat: Center latitude
        lon: Center longitude
        radius_km: Radius in kilometers
    
    Returns:
        Tuple: (min_lat, max_lat, min_lon, max_lon)
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Angular distance in radians
    angular_distance = radius_km / R
    
    # Calculate bounding box
    min_lat = lat - math.degrees(angular_distance)
    max_lat = lat + math.degrees(angular_distance)
    
    # Adjust for longitude (depends on latitude)
    min_lon = lon - math.degrees(angular_distance / math.cos(math.radians(lat)))
    max_lon = lon + math.degrees(angular_distance / math.cos(math.radians(lat)))
    
    return (min_lat, max_lat, min_lon, max_lon)