from dataclasses import dataclass
from math import log1p

@dataclass
class Item:
    id: int
    distance_km: float
    clicks: int
    views: int
    relevance_score: float  # 0.0..1.0

def engagement_score(clicks: int, views: int) -> float:
    if views <= 0:
        return 0.0
    ctr = clicks / views
    return min(1.0, log1p(views) * ctr)

def proximity_score(distance_km: float) -> float:
    return 1.0 / (1.0 + distance_km)

def rank_score(item: Item,
               w_d: float = 0.5,
               w_e: float = 0.3,
               w_r: float = 0.2) -> float:
    return (
        w_d * proximity_score(item.distance_km) +
        w_e * engagement_score(item.clicks, item.views) +
        w_r * item.relevance_score
    )

def rank_items(items: list[Item]) -> list[Item]:
    return sorted(items, key=rank_score, reverse=True)