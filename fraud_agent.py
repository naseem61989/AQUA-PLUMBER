import pandas as pd
import datetime
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# 1. Aapki Sheet ka exact CSV export link
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1s1KNzCtgn1SI3EsR93AArMey-cPA_hp1wG70hF5H_Qs/export?format=csv"

# 2. Google Ads Campaign aur Account ki IDs (Bina dashes ke)
CAMPAIGN_ID = "23225528606"
CUSTOMER_ID = "5345847360"

def get_suspicious_ips():
    try:
        # Sheet se data read karna
        df = pd.read_csv(SHEET_CSV_URL)
        df['Time'] = pd.to_datetime(df['Time'])
        
        # Logic: Pichle 24 ghante mein 3 se zyada clicks wali IPs nikalna
        now = datetime.datetime.now(datetime.timezone.utc)
        last_24_hours = now - datetime.timedelta(hours=24)
        df_recent = df[df['Time'] > last_24_hours]
        
        ip_counts = df_recent['IP'].value_counts()
        fraud_ips = ip_counts[ip_counts >= 3].index.tolist()
        
        return fraud_ips
    except Exception as e:
        print(f"Sheet read karne mein masla aaya: {e}")
        return []

def block_ip_in_google_ads(client, customer_id, campaign_id, ip_address):
    campaign_criterion_service = client.get_service("CampaignCriterionService")
    campaign_criterion_operation = client.get_type("CampaignCriterionOperation")
    
    criterion = campaign_criterion_operation.create
    criterion.campaign = client.get_service("CampaignService").campaign_path(customer_id, campaign_id)
    criterion.negative = True
    criterion.ip_block.ip_address = ip_address
    
    try:
        campaign_criterion_response = campaign_criterion_service.mutate_campaign_criteria(
            customer_id=customer_id, 
            operations=[campaign_criterion_operation]
        )
        print(f"Successfully blocked IP: {ip_address}")
    except GoogleAdsException as ex:
        print(f"Failed to block IP {ip_address}: {ex}")

def main():
    print("Starting Click Fraud Agent...")
    fraud_ips = get_suspicious_ips()
    
    if not fraud_ips:
        print("No suspicious IPs found.")
        return

    # Google Ads Client Initialize karna
    try:
        googleads_client = GoogleAdsClient.load_from_storage("google-ads.yaml")
        for ip in fraud_ips:
            print(f"Blocking IP {ip} in Campaign {CAMPAIGN_ID}...")
            block_ip_in_google_ads(googleads_client, CUSTOMER_ID, CAMPAIGN_ID, ip)
    except Exception as e:
        print(f"Error initializing Google Ads API: {e}")

if __name__ == "__main__":
    main()