#!/usr/bin/env python3
"""
Script to remove Git merge conflict markers from files.
Removes lines containing: <<<<<<<, =======, >>>>>>>
"""

import os
import re
from pathlib import Path

def clean_merge_conflicts(file_path):
    """Remove merge conflict markers from a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Check if file has merge conflict markers
        if not any(marker in content for marker in ['<<<<<<<', '=======', '>>>>>>>']):
            return False
        
        # Split into lines
        lines = content.split('\n')
        cleaned_lines = []
        skip_mode = False
        
        for line in lines:
            # Check for conflict markers
            if line.startswith('<<<<<<<'):
                skip_mode = False  # Keep the HEAD version
                continue
            elif line.startswith('======='):
                skip_mode = True  # Start skipping the incoming version
                continue
            elif line.startswith('>>>>>>>'):
                skip_mode = False  # Stop skipping
                continue
            
            # Add line if not in skip mode
            if not skip_mode:
                cleaned_lines.append(line)
        
        # Write cleaned content back
        cleaned_content = '\n'.join(cleaned_lines)
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(cleaned_content)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to clean all files in the project."""
    project_root = Path('.')
    
    # Patterns to exclude
    exclude_patterns = [
        'node_modules',
        '.git',
        '__pycache__',
        '.venv',
        'venv',
        'dist',
        'build',
        '.next',
        'coverage'
    ]
    
    cleaned_count = 0
    
    print("Scanning for merge conflict markers...")
    print("=" * 60)
    
    # Walk through all files
    for root, dirs, files in os.walk(project_root):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_patterns]
        
        for file in files:
            file_path = Path(root) / file
            
            # Skip binary files and certain extensions
            if file_path.suffix in ['.pyc', '.pyo', '.so', '.dll', '.exe', '.bin', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot']:
                continue
            
            if clean_merge_conflicts(file_path):
                print(f"✓ Cleaned: {file_path}")
                cleaned_count += 1
    
    print("=" * 60)
    print(f"Cleaned {cleaned_count} files")

if __name__ == '__main__':
    main()