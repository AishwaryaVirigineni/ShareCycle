"""
Quick prompts library - prewritten canned messages for fast replies.
All prompts are pre-sanitized and contain no PII.
"""

from typing import Dict, List


# Quick prompts catalog organized by category
QUICK_PROMPTS: Dict[str, Dict] = {
    "arrival": {
        "id": "arrival",
        "name": "Arrival",
        "items": [
            {
                "id": "arrival_restroom",
                "text": "I'm here near the restroom entrance."
            },
            {
                "id": "arrival_water",
                "text": "I'm by the water fountain."
            },
            {
                "id": "arrival_cafeteria",
                "text": "I'm outside the cafeteria doors."
            },
            {
                "id": "arrival_library",
                "text": "I'm at the library entrance."
            },
            {
                "id": "arrival_main",
                "text": "I'm at the main entrance."
            }
        ]
    },
    "en_route": {
        "id": "en_route",
        "name": "En Route",
        "items": [
            {
                "id": "en_route_2min",
                "text": "On my way (about 2 minutes)."
            },
            {
                "id": "en_route_now",
                "text": "Walking over now."
            },
            {
                "id": "en_route_elevator",
                "text": "Elevator's slow, be there soon."
            },
            {
                "id": "en_route_coming",
                "text": "Coming right now."
            },
            {
                "id": "en_route_almost",
                "text": "Almost there!"
            }
        ]
    },
    "coordination": {
        "id": "coordination",
        "name": "Coordination",
        "items": [
            {
                "id": "coord_info_desk",
                "text": "Can we meet by the information desk?"
            },
            {
                "id": "coord_stall2",
                "text": "I'm in stall 2."
            },
            {
                "id": "coord_blue_hoodie",
                "text": "I'm wearing a blue hoodie."
            },
            {
                "id": "coord_red_shirt",
                "text": "I'm wearing a red shirt."
            },
            {
                "id": "coord_second_floor",
                "text": "I'm on the second floor."
            },
            {
                "id": "coord_near_elevator",
                "text": "I'm near the elevator."
            }
        ]
    },
    "gratitude": {
        "id": "gratitude",
        "name": "Gratitude",
        "items": [
            {
                "id": "gratitude_thanks",
                "text": "Thank you so much."
            },
            {
                "id": "gratitude_appreciate",
                "text": "Really appreciate your help."
            },
            {
                "id": "gratitude_lifesaver",
                "text": "You're a lifesaver."
            },
            {
                "id": "gratitude_amazing",
                "text": "You're amazing, thank you!"
            },
            {
                "id": "gratitude_so_kind",
                "text": "That's so kind of you, thanks!"
            }
        ]
    }
}


def get_all_prompts() -> List[Dict]:
    """
    Get all quick prompts organized by category.
    
    Returns:
        List of category dictionaries with id, name, and items
    """
    return list(QUICK_PROMPTS.values())


def get_prompt_by_id(prompt_id: str) -> str:
    """
    Get prompt text by ID.
    
    Args:
        prompt_id: The ID of the prompt (e.g., "arrival_restroom")
    
    Returns:
        Prompt text, or empty string if not found
    """
    for category in QUICK_PROMPTS.values():
        for item in category["items"]:
            if item["id"] == prompt_id:
                return item["text"]
    return ""

