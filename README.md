# Sisters and Brows - Booking System

1. Setup Credentials
   Go to Google Cloud Console.
   Create a Service Account.
   Download the JSON key.
   Enable "Google Sheets API".
   Share your Google Sheet with the `client_email` from your JSON key.

2. Configure Environment
   Create a `.env.local` file.
   Copy the variables from `.env.example` or the guide.
   Paste your Private Key, Email, and Sheet ID.

3. Run the Project
   Type `npm run dev` in the terminal.
   Open `http://localhost:3000`.
   Fill out the form to test.

4. Check Google Sheets
   Look at the "Raw_Data" tab (ensure headers match: Date, Name, Phone, Service, Branch).
   Look at the "Dashboard" tab to see the sorted view.

5. Setup Credentials (DONE)
   - Created 'sisters-booking-app' in Google Cloud.
   - Enabled 'Google Sheets API'.
   - Created Service Account & Downloaded JSON.
   - IMPORTANT: Shared the actual Google Sheet with the Service Account email.