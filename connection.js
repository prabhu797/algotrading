import { SmartAPI } from 'smartapi-javascript';
import fs from 'fs';
import details from './details.js';
import { config } from 'dotenv';
import { scheduleExecution } from './tickData.js'; // Fixed function name
config();

export async function establishConnection(password, totp) {
	let smart_api = new SmartAPI({
		api_key: details.apiKey, // PROVIDE YOUR API KEY HERE
		// OPTIONAL: If user has valid access token and refresh token, they can be passed directly to the constructor.
		// access_token: "YOUR_ACCESS_TOKEN",
		// refresh_token: "YOUR_REFRESH_TOKEN"
	});

	try {
		const initialData = await smart_api.generateSession(details.customer_id, password, totp);
		console.log("Initial Data", initialData);

		if (initialData.status) {
			const envContent = `JWT_TOKEN="${initialData.data.jwtToken}"\nREFRESH_TOKEN="${initialData.data.refreshToken}"\nFEED_TOKEN="${initialData.data.feedToken}"`;
			fs.writeFileSync('.env', envContent);
		}

		const profileData = await smart_api.getProfile();
		console.log("Final Data", profileData);

		scheduleExecution(); // Ensure this function is correctly named and imported
		return { code: "success", message: "Logged in successfully" };
	} catch (ex) {
		console.log("Error", ex);
		return { code: "error", message: ex.message || ex };
	}
}
