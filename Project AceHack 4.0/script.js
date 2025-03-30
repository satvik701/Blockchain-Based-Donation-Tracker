// Check if the browser has Web3 support
if (typeof window.ethereum !== 'undefined') {
    var web3 = new Web3(window.ethereum);
    console.log("Web3 is enabled");
} else {
    alert("Please install MetaMask or another Ethereum wallet to interact with this site.");
}

// Contract address and ABI (Replace with your deployed contract details)
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address
const contractABI = [
    // Replace with the ABI from Remix or your contract's ABI
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDonations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDonationHistory",
        "outputs": [
            {
                "internalType": "tuple[]",
                "name": "",
                "type": "tuple[]",
                "components": [
                    {
                        "internalType": "address",
                        "name": "donor",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let contract;
let account;

async function init() {
    // Request user's Ethereum account access
    if (window.ethereum) {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
        console.log("Connected account: " + account);

        contract = new web3.eth.Contract(contractABI, contractAddress);
        loadTotalDonations();
        loadDonationHistory();
    }
}

async function donate() {
    const donationAmount = document.getElementById("donationAmount").value;

    if (donationAmount && !isNaN(donationAmount) && donationAmount > 0) {
        try {
            // Send donation transaction to the smart contract
            await contract.methods.donate().send({
                from: account,
                value: web3.utils.toWei(donationAmount, 'wei')
            });

            alert("Donation successful!");
            loadTotalDonations();
            loadDonationHistory();
        } catch (error) {
            console.error(error);
            alert("Donation failed. Please try again.");
        }
    } else {
        alert("Please enter a valid donation amount.");
    }
}

async function loadTotalDonations() {
    try {
        // Fetch total donations from the smart contract
        const totalDonations = await contract.methods.totalDonations().call();
        document.getElementById("totalDonations").innerText = web3.utils.fromWei(totalDonations, 'wei');
    } catch (error) {
        console.error(error);
        alert("Error loading total donations.");
    }
}

async function loadDonationHistory() {
    try {
        // Fetch donation history from the smart contract
        const donationHistory = await contract.methods.getDonationHistory().call();
        const donationHistoryList = document.getElementById("donationHistory");
        donationHistoryList.innerHTML = "";

        for (let i = 0; i < donationHistory.length; i++) {
            const donation = donationHistory[i];
            const listItem = document.createElement("li");
            listItem.textContent = `Donor: ${donation.donor} - Amount: ${web3.utils.fromWei(donation.amount, 'wei')} Wei`;
            donationHistoryList.appendChild(listItem);
        }
    } catch (error) {
        console.error(error);
        alert("Error loading donation history.");
    }
}

// Initialize the app when the window is loaded
window.onload = init;
