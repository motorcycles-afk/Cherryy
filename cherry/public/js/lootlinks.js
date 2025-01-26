const lootlinks = [
  "https://lootdest.org/s?4iIaIFkH",
  "https://loot-link.com/s?tiWbwiUA",
  "https://lootdest.org/s?tLoCu36G",
  "https://lootdest.org/s?Rn9ScbR2",
  "https://lootdest.org/s?ADzl8Jk3",
  "https://loot-link.com/s?M2oo5P4j",
  "https://lootdest.org/s?a7Mm0Xjs"
];

function checkLootlinks() {
  let completedLinks = 0;
  lootlinks.forEach(link => {
    fetch(link)
      .then(response => {
        if (response.ok) {
          completedLinks++;
          if (completedLinks === 3) {
            generateKey();
          }
        }
      })
      .catch(error => console.error('Error checking lootlink:', error));
  });
}

function generateKey() {
  fetch('https://api.cryptolens.io/api/key/CreateKey?token=WyIxMDIxMzQ2NTkiLCJrMVNvb0gyaU9aOCtQZlFYcmswdFVvR05peXpFV3VZU3VMd2diU2w5Il0=&ProductId=28722&Period=1&F1=False&F2=False&F3=False&F4=False&F5=False&F6=False&F7=False&F8=False&Notes=idk&Block=False&CustomerId=0&TrialActivation=True&MaxNoOfMachines=1&NoOfKeys=0&NewCustomer=False&AddOrUseExistingCustomer=False&ResellerId=0&EnableCustomerAssociation=False&AllowActivationManagement=False&AllowMultipleUserAssociation=False&format=plaintext')
    .then(response => response.text())
    .then(key => {
      document.getElementById('key').innerText = key;
    })
    .catch(error => console.error('Error generating key:', error));
}
