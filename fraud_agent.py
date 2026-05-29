import pandas as pd
import datetime
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

# 1. Sheet CSV URL
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1s1KNzCtgn1SI3EsR93AArMey-cPA_hp1wG70hF5H_Qs/export?format=csv"

# 2. Clients Dictionary (Updated with your specific site names)
CLIENT_ACCOUNTS = {
    "Aqua Plumber": {"customer_id": "5345847360", "campaign_id": "23225528606"},
    "autorepair-dubai": {"customer_id": "9896735391", "campaign_id": "23774070662"},
    "Awais Ac Plumber": {"customer_id": "1917484525", "campaign_id": "23425384015"},
    "fine appliance repair": {"customer_id": "7847863590", "campaign_id": "21377716270"},
    "seoblogy": {"customer_id": "9906499431", "campaign_id": "22163455644"},
    "carpentery services": {"customer_id": "2070760058", "campaign_id": "22395702636"},
    "Ijaz Appliance Repair": {"customer_id": "4337360239", "campaign_id": "22052849918"},
    "Appliance repair Imtiaz": {"customer_id": "2228623049", "campaign_id": "23014979991"},
    "Adnan handyman services": {"customer_id": "7367369491", "campaign_id": "18368441225"},
    "Bin Technical Wahab": {"customer_id": "9137459513", "campaign_id": "21878163240"}
}

def get_suspicious_ips_for_client(df, website_name):
    try:
        # Check if necessary columns exist
        if 'Website' not in df.columns or 'Device_ID' not in df.columns or 'Is_Bot' not in df.columns:
            return []

        client_df = df[df['Website'] == website_name]
        if client_df.empty:
            return []

        # Filter last 24 hours
        now = pd.Timestamp.utcnow()
        last_24_hours = now - pd.Timedelta(hours=24)
        df_recent = client_df[client_df['Time'] > last_24_hours]
        
        ips_to_block = set()

        # RULE 1: Immediate Block for Robotic Bots or VPNs (1st Click)
        bots_df = df_recent[df_recent['Is_Bot'].astype(str).str.strip().str.title() == 'True']
        for ip in bots_df['IP'].unique():
            ips_to_block.add(ip)

        # Separate human traffic for 3-strike rules
        humans_df = df_recent[df_recent['Is_Bot'].astype(str).str.strip().str.title() != 'True']

        # RULE 2: Device Fingerprint Strike (If same device changes IP 3 times)
        device_counts = humans_df['Device_ID'].value_counts()
        bad_devices = device_counts[device_counts >= 3].index.tolist()
        for device in bad_devices:
            device_ips = humans_df[humans_df['Device_ID'] == device]['IP'].unique()
            for ip in device_ips:
                ips_to_block.add(ip)

        # RULE 3: Normal IP Strike (3 clicks from same IP)
        ip_counts = humans_df['IP'].value_counts()
        bad_ips = ip_counts[ip_counts >= 3].index.tolist()
        for ip in bad_ips:
            ips_to_block.add(ip)
        
        return list(ips_to_block)

    except Exception as e:
        print(f"[{website_name}] Error filtering data: {e}")
        return []

def block_ip_in_google_ads(client, customer_id, campaign_id, ip_address):
    campaign_criterion_service = client.get_service("CampaignCriterionService")
    campaign_criterion_operation = client.get_type("CampaignCriterionOperation")
    
    criterion = campaign_criterion_operation.create
    criterion.campaign = client.get_service("CampaignService").campaign_path(customer_id, campaign_id)
    criterion.negative = True
    criterion.ip_block.ip_address = ip_address
    
    try:
        campaign_criterion_service.mutate_campaign_criteria(
            customer_id=customer_id, 
            operations=[campaign_criterion_operation]
        )
        print(f"Successfully blocked IP: {ip_address} in Campaign {campaign_id}")
    except GoogleAdsException as ex:
        error_msg = str(ex)
        if "CriterionError.CRITERION_ALREADY_EXISTS" in error_msg:
            print(f"IP {ip_address} is already blocked.")
        else:
            print(f"Failed to block IP {ip_address}: {ex.error_code}")

def main():
    print("Starting Advanced Click Fraud Agent...")
    
    try:
        df = pd.read_csv(SHEET_CSV_URL)
        df['Time'] = pd.to_datetime(df['Time'], utc=True)
    except Exception as e:
        print(f"Global Sheet load failed: {e}")
        return

    try:
        googleads_client = GoogleAdsClient.load_from_storage("google-ads.yaml")
    except Exception as e:
        print(f"Error initializing API: {e}")
        return

    for site_name, account_data in CLIENT_ACCOUNTS.items():
        print(f"\n--- Checking Fraud for: {site_name} ---")
        
        fraud_ips = get_suspicious_ips_for_client(df, site_name)
        
        if not fraud_ips:
            print(f"No suspicious activity found.")
            continue
            
        cust_id = account_data["customer_id"]
        camp_id = account_data["campaign_id"]
        
        for ip in fraud_ips:
            print(f"Action Triggered! Blocking IP {ip} for {site_name}...")
            block_ip_in_google_ads(googleads_client, cust_id, camp_id, ip)
            
    print("\nGlobal Fraud Sweep Completed Successfully.")

if __name__ == "__main__":
    main()
