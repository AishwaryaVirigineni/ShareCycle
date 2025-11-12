#!/bin/bash
# Test runner script with optional HTML report

cd "$(dirname "$0")/.."

# Create test-results directory
mkdir -p test-results

# Check if pytest-html is installed
if python3 -c "import pytest_html" 2>/dev/null; then
    echo "Running tests with HTML report..."
    pytest --html=test-results/report.html --self-contained-html
else
    echo "Running tests (install pytest-html for HTML reports: pip install pytest-html)..."
    pytest
fi

echo ""
echo "Test results saved to:"
echo "  - test-results/junit.xml (JUnit XML format)"
if [ -f "test-results/report.html" ]; then
    echo "  - test-results/report.html (HTML report)"
    echo ""
    echo "View HTML report: open test-results/report.html"
fi

