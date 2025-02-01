import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CUTY_TOKEN = '9881c9e87938fa5c7f22d70d3';
const CRYPTOLENS_TOKEN = 'WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=';

async function shortenUrl(url, alias = '') {
    try {
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://api.cuty.io/quick?token=${CUTY_TOKEN}&url=${encodedUrl}${alias ? `&alias=${alias}` : ''}`;
        const response = await axios.get(apiUrl);
        return response.data.short_url;
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        throw error;
    }
}

async function generateCryptolensKey() {
    try {
        const apiUrl = 'https://api.cryptolens.io/api/key/CreateKey';
        const params = {
            token: CRYPTOLENS_TOKEN,
            ProductId: 28722,
            Period: 1,
            F1: false,
            F2: false,
            F3: false,
            F4: false,
            F5: false,
            F6: false,
            F7: false,
            F8: false,
            Notes: 'idk',
            Block: false,
            CustomerId: 0,
            TrialActivation: true,
            MaxNoOfMachines: 1,
            NoOfKeys: 0,
            NewCustomer: false,
            AddOrUseExistingCustomer: false,
            ResellerId: 0,
            EnableCustomerAssociation: false,
            AllowActivationManagement: false,
            AllowMultipleUserAssociation: false,
            format: 'plaintext'
        };

        const response = await axios.get(apiUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Error generating Cryptolens key:', error.message);
        throw error;
    }
}

async function logKeyToFile(key) {
    const logPath = path.join(__dirname, '..', 'logs', 'license-keys.log');
    const logEntry = `${new Date().toISOString()} - Generated Key: ${key}\n`;
    
    try {
        await fs.promises.appendFile(logPath, logEntry);
    } catch (error) {
        console.error('Error logging key:', error.message);
    }
}

async function generateKeyWithShortUrls(urls) {
    try {
        // Generate short URLs
        const shortUrls = await Promise.all(
            urls.map((url, index) => shortenUrl(url, `custom${index + 1}`))
        );

        // Generate Cryptolens key
        const key = await generateCryptolensKey();

        // Log the key
        await logKeyToFile(key);

        return {
            shortUrls,
            key
        };
    } catch (error) {
        console.error('Error in key generation process:', error.message);
        throw error;
    }
}

export {
    generateKeyWithShortUrls
};
