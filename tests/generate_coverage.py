#!/usr/bin/env python
"""
Generate a coverage report for the Hopple codebase.
"""

import os
import sys
import subprocess
import webbrowser
import argparse


def generate_coverage_report(open_browser: bool = True, unit_only: bool = False):
    """
    Generate a coverage report and optionally open it in a browser.
    
    Args:
        open_browser: Whether to open the report in a browser
        unit_only: Whether to only run unit tests
    """
    print("Generating coverage report...")
    
    # Create the htmlcov directory if it doesn't exist
    os.makedirs("htmlcov", exist_ok=True)
    
    # Build the pytest command
    cmd = [
        "pytest",
        "--cov=hopple",
        "--cov-report=term",
        "--cov-report=html:htmlcov"
    ]
    
    if unit_only:
        cmd.append("-m")
        cmd.append("unit")
    
    # Run pytest with coverage
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Print the output
    print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    # Open the report in a browser if requested
    if open_browser:
        report_path = os.path.join(os.getcwd(), "htmlcov", "index.html")
        if os.path.exists(report_path):
            print(f"Opening coverage report: {report_path}")
            webbrowser.open(f"file://{report_path}")
        else:
            print(f"Could not find coverage report at {report_path}")


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate a coverage report for Hopple")
    
    parser.add_argument(
        "--no-browser", action="store_true", help="Don't open the report in a browser"
    )
    parser.add_argument(
        "--unit-only", action="store_true", help="Only run unit tests"
    )
    
    return parser.parse_args()


def main():
    """Main function."""
    args = parse_arguments()
    
    generate_coverage_report(not args.no_browser, args.unit_only)


if __name__ == "__main__":
    main() 