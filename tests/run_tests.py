#!/usr/bin/env python
"""
Test runner script for Hopple.

This script provides a convenient way to run different types of tests.
"""

import os
import sys
import argparse
import pytest
import subprocess


def run_unit_tests(verbose: bool = False, cov: bool = False):
    """Run unit tests."""
    print("Running unit tests...")
    args = ["-m", "unit"]
    if verbose:
        args.append("-v")
    if cov:
        args.extend(["--cov=hopple", "--cov-report=term-missing"])
    return pytest.main(args)


def run_integration_tests(verbose: bool = False, cov: bool = False):
    """Run integration tests."""
    print("Running integration tests...")
    args = ["-m", "integration"]
    if verbose:
        args.append("-v")
    if cov:
        args.extend(["--cov=hopple", "--cov-report=term-missing"])
    return pytest.main(args)


def run_e2e_tests(verbose: bool = False):
    """Run end-to-end tests."""
    print("Running end-to-end tests...")
    args = ["-m", "e2e"]
    if verbose:
        args.append("-v")
    return pytest.main(args)


def run_all_tests(verbose: bool = False, cov: bool = False):
    """Run all tests."""
    print("Running all tests...")
    args = []
    if verbose:
        args.append("-v")
    if cov:
        args.extend(["--cov=hopple", "--cov-report=term-missing"])
    return pytest.main(args)


def run_mypy():
    """Run mypy type checking."""
    print("Running mypy...")
    return subprocess.call(["mypy", "hopple"])


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Run tests for Hopple")
    
    parser.add_argument(
        "--unit", action="store_true", help="Run unit tests"
    )
    parser.add_argument(
        "--integration", action="store_true", help="Run integration tests"
    )
    parser.add_argument(
        "--e2e", action="store_true", help="Run end-to-end tests"
    )
    parser.add_argument(
        "--all", action="store_true", help="Run all tests"
    )
    parser.add_argument(
        "--mypy", action="store_true", help="Run mypy type checking"
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Verbose output"
    )
    parser.add_argument(
        "--cov", action="store_true", help="Generate coverage report"
    )
    
    return parser.parse_args()


def main():
    """Main function."""
    args = parse_arguments()
    
    # Default to running all tests if no specific test type is specified
    if not (args.unit or args.integration or args.e2e or args.all or args.mypy):
        args.all = True
    
    # Run all tests
    if args.all:
        exit_code = run_all_tests(args.verbose, args.cov)
        if exit_code != 0:
            sys.exit(exit_code)
    
    # Run unit tests
    if args.unit:
        exit_code = run_unit_tests(args.verbose, args.cov)
        if exit_code != 0:
            sys.exit(exit_code)
    
    # Run integration tests
    if args.integration:
        exit_code = run_integration_tests(args.verbose, args.cov)
        if exit_code != 0:
            sys.exit(exit_code)
    
    # Run end-to-end tests
    if args.e2e:
        exit_code = run_e2e_tests(args.verbose)
        if exit_code != 0:
            sys.exit(exit_code)
    
    # Run mypy
    if args.mypy:
        exit_code = run_mypy()
        if exit_code != 0:
            sys.exit(exit_code)


if __name__ == "__main__":
    main() 