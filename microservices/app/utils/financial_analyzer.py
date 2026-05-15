from typing import List, Dict

def detect_financial_anomalies(bidders: List[Dict], estimated_value: float) -> List[Dict]:
    """
    Detects financial anomalies in bidder quotes.
    Anomalies include:
    1. Quote > 150% of Estimate (Too High)
    2. Quote < 50% of Estimate (Too Low/Predatory)
    3. Quotes very close to each other (Possible Collusion - Not implemented here)
    """
    results = []
    for b in bidders:
        quote = b.get("quotedValue", 0)
        anomaly = "None"
        if quote > 0:
            if quote < (estimated_value * 0.5):
                anomaly = "Predatory Pricing"
            elif quote > (estimated_value * 1.5):
                anomaly = "Exorbitant Quote"
        
        results.append({
            **b,
            "anomaly": anomaly
        })
    return results
