const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.post('/generate-key', async (req, res) => {
const { user_id, lootlinksCompleted } = req.body;

if (!lootlinksCompleted) {
  return res.json({ success: false, error: 'Lootlinks not completed' });
}

try {
    const response = await fetch('https://api.cryptolens.io/api/key/CreateKey?token=WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=&ProductId=28722&Period=1&F1=False&F2=False&F3=False&F4=False&F5=False&F6=False&F7=False&F8=False&Notes=idk&Block=False&CustomerId=0&TrialActivation=True&MaxNoOfMachines=1&NoOfKeys=0&NewCustomer=False&AddOrUseExistingCustomer=False&ResellerId=0&EnableCustomerAssociation=False&AllowActivationManagement=False&AllowMultipleUserAssociation=False&format=plaintext');
    const key = await response.text();

    res.json({ success: true, key });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
