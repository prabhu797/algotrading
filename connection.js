import { SmartAPI } from 'smartapi-javascript';
import fs from 'fs';
import details from './details.js';
import { config } from 'dotenv';
config();

let smart_api = new SmartAPI({
	api_key: details.apiKey, // PROVIDE YOUR API KEY HERE
	// OPTIONAL : If user has valid access token and refresh token then it can be directly passed to the constructor.
	// access_token: "YOUR_ACCESS_TOKEN",
	// refresh_token: "YOUR_REFRESH_TOKEN"
});

smart_api
	.generateSession(details.customer_id, details.password, details.totp)
	.then((data) => {
        console.log("Initial Data", data);
        if(data.status) {
            const envContent = `JWT_TOKEN="${data.data.jwtToken}"\nREFRESH_TOKEN="${data.data.refreshToken}"\nFEED_TOKEN="${data.data.feedToken}"`;
            fs.writeFileSync('.env', envContent);
        }
		return smart_api.getProfile();
    })
	.then((data) => {
		console.log("Final Data", data);
	})
	.catch((ex) => {
		console.log("Error", ex);
	});