import pandas as pd
import datetime
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# 1. Aapki Sheet ka exact CSV export link
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1s1KNzCtgn1SI3EsR93AArMey-cPA_hp1wG70hF5H_Qs/export?format=csv"

# 2. Tamam 10 Clients Ki List (Dashes hata kar sirf numbers daale gaye hain)
CLIENT_ACCOUNTS = {
    "Site_1": {"customer_id": "5345847360", "campaign_id": "23225528606"},
    "Site_2": {"customer_id": "9896735391", "campaign_id": "23774070662"},
    "Site_3": {"customer_id": "1917484525", "campaign_id": "23425384015"},
    "Site_4": {"customer_id": "7847863590", "campaign_id": "21377716270"},
    "Site_5": {"customer_id": "9906499431", "campaign_id": "22163455644"},
    "Site_6": {"customer_id": "2070760058", "campaign_id": "22395702636"},
    "Site_7": {"customer_id": "4337360239", "campaign_id": "22052849918"},
    "Site_8": {"customer_id": "2228623049", "campaign_id": "23014979991"},
    "Site_9": {"customer_id": "7367369491", "campaign_id": "18368441225"},
    "Site_10": {"customer_id": "9137459513", "campaign_id": "21878163240"}
}

def get_suspicious_ips_for_client(df, website_name):
    try:
        # Check karein ke Sheet mein 'Website' ka column mojood hai ya nahi
        if 'Website' not in df.columns:
            print(f"Warning: 'Website' column not found in Google Sheet. Make sure your JS/PHP script is sending it.")
            return []

        # Sirf us specific client ki website ka data filter karein
        client_df = df[df['Website'] == website_name]
        
        if client_df.empty:
            return []

        # Logic: Pichle 24 ghante mein 3 se zyada clicks wali IPs nikalna
        now = pd.Timestamp.utcnow()
        last_24_hours = now - pd.Timedelta(hours=24)
        df_recent = client_df[client_df['Time'] > last_24_hours]
        
        ip_counts = df_recent['IP'].value_counts()
        fraud_ips = ip_counts[ip_counts >= 3].index.tolist()
        
        return fraud_ips
    except Exception as e:
        print(f"[{website_name}] Data filter karne mein masla aaya: {e}")
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
        print(f"Successfully blocked IP: {ip_address} in Campaign {campaign_id}")
    except GoogleAdsException as ex:
        # Ignore karein agar IP pehle se block list mein mojood hai
        error_msg = str(ex)
        if "CriterionError.CRITERION_ALREADY_EXISTS" in error_msg:
            print(f"IP {ip_address} is already blocked in Campaign {campaign_id}.")
        else:
            print(f"Failed to block IP {ip_address} in account {customer_id}: {ex.error_code}")

def main():
    print("Starting Global Click Fraud Agent for Multiple Accounts...")
    
    # Ek hi dafa Google Sheet read karein taake API aur Time dono bachein
    try:
        df = pd.read_csv(SHEET_CSV_URL)
        df['Time'] = pd.to_datetime(df['Time'], utc=True)
    except Exception as e:
        print(f"Global Sheet load karne mein masla aaya: {e}")
        return

    # Google Ads Client ek hi dafa load karein (MCC credentials ke sath)
    try:
        googleads_client = GoogleAdsClient.load_from_storage("google-ads.yaml")
    except Exception as e:
        print(f"Error initializing Google Ads API: {e}")
        return

    # Loop: Har account ko baari baari check aur clean karein
    for site_name, account_data in CLIENT_ACCOUNTS.items():
        print(f"\n--- Checking Fraud for: {site_name} ---")
        
        fraud_ips = get_suspicious_ips_for_client(df, site_name)
        
        if not fraud_ips:
            print(f"No suspicious clicks found for {site_name}.")
            continue
            
        cust_id = account_data["customer_id"]
        camp_id = account_data["campaign_id"]
        
        for ip in fraud_ips:
            print(f"Action Triggered! Blocking IP {ip} for {site_name}...")
            block_ip_in_google_ads(googleads_client, cust_id, camp_id, ip)
            
    print("\nGlobal Fraud Sweep Completed Successfully.")

if __name__ == "__main__":
    main()
