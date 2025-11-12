"""
Safety filter for chat messages.
Regex-first redaction for PII: EMAIL, PHONE, @HANDLE, URL, AGE, and self-identification patterns.
"""

import re
from typing import Dict, Tuple, Pattern


# Email pattern: matches standard email formats
EMAIL_PATTERN: Pattern[str] = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
)

# Phone pattern: supports +country codes, spaces, dashes, parentheses
# Matches: 555-1234, 555-123-4567, (555) 123-4567, +1-555-123-4567
PHONE_PATTERN: Pattern[str] = re.compile(
    r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|(\d{3}[-.\s]?\d{4})\b'
)

# Handle pattern: @username (alphanumeric, underscores, dots)
HANDLE_PATTERN: Pattern[str] = re.compile(
    r'@[A-Za-z0-9_.]+'
)

# URL pattern: http/https URLs
URL_PATTERN: Pattern[str] = re.compile(
    r'https?://[^\s<>"{}|\\^`\[\]]+[^\s<>"{}|\\^`\[\].,;:!?]'
)

# Age patterns: "I'm 25", "I am 18 years old", "age 30", "25 years old", "I'm 25 years old"
AGE_PATTERNS: list[Pattern[str]] = [
    re.compile(r"\bI'?m\s+(\d{1,3})\s*(?:years?\s+old|yrs?\.?|years?)?\b", re.IGNORECASE),
    re.compile(r'\bI\s+am\s+(\d{1,3})\s*(?:years?\s+old|yrs?\.?|years?)?\b', re.IGNORECASE),
    re.compile(r'\b(?:age|aged?)\s+(\d{1,3})\s*(?:years?\s+old|yrs?\.?|years?)?\b', re.IGNORECASE),
    re.compile(r'\b(\d{1,3})\s+years?\s+old\b', re.IGNORECASE),
    re.compile(r'\b(\d{1,3})\s+yrs?\.?\b', re.IGNORECASE),
]

def _is_valid_age(age_str: str) -> bool:
    """Check if a number represents a valid age (13-120)."""
    try:
        age = int(age_str)
        return 13 <= age <= 120
    except ValueError:
        return False

# Date of birth patterns: "born in 1995", "DOB: 01/15/2000", "birthday: 1995-01-15"
DOB_PATTERNS: list[Pattern[str]] = [
    re.compile(r'\b(?:born|birthday|DOB|date\s+of\s+birth)[\s:]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b', re.IGNORECASE),
    re.compile(r'\b(?:born|birthday|DOB|date\s+of\s+birth)[\s:]+(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b', re.IGNORECASE),
    re.compile(r'\b(?:born|birthday|DOB)[\s:]+in\s+(\d{4})\b', re.IGNORECASE),
]

# Address patterns: street addresses, zip codes
ADDRESS_PATTERNS: list[Pattern[str]] = [
    re.compile(r'\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct)\b', re.IGNORECASE),
    re.compile(r'\b\d{5}(?:-\d{4})?\s+(?:[A-Z][a-z]+\s*)+[A-Z]{2}\b'),  # ZIP code with state
]

# Self-identification patterns
# "I'm <Name>", "I am <Name>", "my name is <Name>", "this is <Name>"
# Matches common name patterns (capitalized words, 2-30 chars)
SELF_ID_PATTERNS: list[Pattern[str]] = [
    re.compile(r"\bI['']m\s+([A-Z][a-z]{1,29})\b", re.IGNORECASE),
    re.compile(r'\bI\s+am\s+([A-Z][a-z]{1,29})\b', re.IGNORECASE),
    re.compile(r'\bmy\s+name\s+is\s+([A-Z][a-z]{1,29})\b', re.IGNORECASE),
    re.compile(r'\bthis\s+is\s+([A-Z][a-z]{1,29})\b', re.IGNORECASE),
]


def redact(text: str) -> Tuple[str, Dict[str, bool]]:
    """
    Redact PII from text and return redacted text with flags.
    
    Args:
        text: Input text that may contain PII
    
    Returns:
        Tuple of (redacted_text, flags_dict)
        Flags: hadEmail, hadPhone, hadHandle, hadLink, hadName, hadAge, hadDOB, hadAddress
    """
    if not text:
        return text, {
            "hadEmail": False,
            "hadPhone": False,
            "hadHandle": False,
            "hadLink": False,
            "hadName": False,
            "hadAge": False,
            "hadDOB": False,
            "hadAddress": False,
        }
    
    flags = {
        "hadEmail": False,
        "hadPhone": False,
        "hadHandle": False,
        "hadLink": False,
        "hadName": False,
        "hadAge": False,
        "hadDOB": False,
        "hadAddress": False,
    }
    
    # Check and redact emails
    if EMAIL_PATTERN.search(text):
        flags["hadEmail"] = True
        text = EMAIL_PATTERN.sub('[hidden-email]', text)
    
    # Check and redact phone numbers
    if PHONE_PATTERN.search(text):
        flags["hadPhone"] = True
        text = PHONE_PATTERN.sub('[hidden-phone]', text)
    
    # Check and redact @handles
    if HANDLE_PATTERN.search(text):
        flags["hadHandle"] = True
        text = HANDLE_PATTERN.sub('[hidden-handle]', text)
    
    # Check and redact URLs
    if URL_PATTERN.search(text):
        flags["hadLink"] = True
        text = URL_PATTERN.sub('[hidden-link]', text)
    
    # Check and redact age information
    for pattern in AGE_PATTERNS:
        match = pattern.search(text)
        if match:
            age_str = match.group(1)
            # Only redact if it's a valid age range (13-120) to avoid false positives
            if _is_valid_age(age_str):
                flags["hadAge"] = True
                text = pattern.sub('[hidden-age]', text)
                break  # Only need to flag once
    
    # Check and redact date of birth
    for pattern in DOB_PATTERNS:
        if pattern.search(text):
            flags["hadDOB"] = True
            text = pattern.sub(r'[hidden-dob]', text)
            break  # Only need to flag once
    
    # Check and redact addresses
    for pattern in ADDRESS_PATTERNS:
        if pattern.search(text):
            flags["hadAddress"] = True
            text = pattern.sub('[hidden-address]', text)
            break  # Only need to flag once
    
    # Check and redact self-identification patterns
    # Only match if the captured name looks like a real name (not common words/verbs/locations)
    common_words = {
        'here', 'there', 'now', 'then', 'this', 'that',
        'wearing', 'going', 'coming', 'leaving', 'staying', 'waiting',
        'doing', 'trying', 'looking', 'feeling', 'thinking', 'saying',
        'working', 'playing', 'running', 'walking', 'sitting', 'standing',
        'calling', 'texting', 'messaging', 'talking', 'listening', 'watching',
        # Location/preposition words that commonly follow "I'm" or "I am"
        'near', 'at', 'in', 'on', 'by', 'beside', 'next', 'inside', 'outside',
        'behind', 'front', 'back', 'up', 'down', 'left', 'right', 'away',
        'home', 'work', 'school', 'campus', 'building', 'room', 'hall',
        'entrance', 'exit', 'door', 'gate', 'lobby', 'floor', 'level'
    }
    for pattern in SELF_ID_PATTERNS:
        match = pattern.search(text)
        if match:
            name = match.group(1)
            # Only redact if it's not a common word/verb
            if name.lower() not in common_words:
                flags["hadName"] = True
                # Replace the name part with [hidden-name]
                text = pattern.sub(lambda m: m.group(0).replace(m.group(1), '[hidden-name]'), text)
    
    return text, flags

