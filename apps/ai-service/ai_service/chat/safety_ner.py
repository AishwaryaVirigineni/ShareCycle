"""
Optional spaCy NER (Named Entity Recognition) for PERSON redaction.
Only enabled when ENABLE_SPACY_NER=true.
"""

from typing import Tuple, Optional


def redact_persons(text: str) -> Tuple[str, bool]:
    """
    Redact person names using spaCy NER (if enabled).
    
    Args:
        text: Input text that may contain person names
    
    Returns:
        Tuple of (redacted_text, hadPerson_flag)
        If spaCy is not enabled, returns original text and False.
    """
    # Check if spaCy NER is enabled
    from ..config import get_enable_spacy_ner
    
    if not get_enable_spacy_ner():
        return text, False
    
    try:
        import spacy
        
        # Load spaCy model (cache it if possible)
        # Note: In production, you'd want to cache the nlp object
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Model not installed, fall back to no-op
            return text, False
        
        doc = nlp(text)
        had_person = False
        redacted_text = text
        
        # Process entities in reverse order to maintain indices
        entities = [(ent.start_char, ent.end_char, ent.text) 
                   for ent in doc.ents if ent.label_ == "PERSON"]
        
        if entities:
            had_person = True
            # Replace from end to start to preserve indices
            for start, end, _ in reversed(entities):
                redacted_text = (
                    redacted_text[:start] + 
                    '[hidden-person]' + 
                    redacted_text[end:]
                )
        
        return redacted_text, had_person
    
    except ImportError:
        # spaCy not installed, fall back to no-op
        return text, False
    except Exception:
        # Any other error, fall back to no-op
        return text, False

