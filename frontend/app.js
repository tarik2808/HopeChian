const contractAddress = "0xd1EEF550A1dD5a52d1a8640Fdd2Da330B8552c29";
const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"collected","type":"uint256"},{"indexed":false,"internalType":"bool","name":"goalReached","type":"bool"}],"name":"CampaignClosed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"goal","type":"uint256"},{"indexed":false,"internalType":"address","name":"campaignOwner","type":"address"}],"name":"CampaignCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newName","type":"string"},{"indexed":false,"internalType":"string","name":"newDescription","type":"string"},{"indexed":false,"internalType":"uint256","name":"newGoal","type":"uint256"}],"name":"CampaignEdited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"campaignId","type":"uint256"},{"indexed":false,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"DonationReceived","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"campaigns","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address payable","name":"owner","type":"address"},{"internalType":"uint256","name":"goal","type":"uint256"},{"internalType":"uint256","name":"collected","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"closeCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"donate","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"donations","outputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"address","name":"donor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"string","name":"newName","type":"string"},{"internalType":"string","name":"newDescription","type":"string"},{"internalType":"uint256","name":"newGoal","type":"uint256"}],"name":"editCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getActiveCampaigns","outputs":[{"internalType":"uint256[]","name":"activeCampaignIds","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"getCampaignDetails","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address","name":"campaignOwner","type":"address"},{"internalType":"uint256","name":"goal","type":"uint256"},{"internalType":"uint256","name":"collected","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"campaignId","type":"uint256"}],"name":"getDonations","outputs":[{"components":[{"internalType":"uint256","name":"campaignId","type":"uint256"},{"internalType":"address","name":"donor","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct HopeChain.Donation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCampaigns","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
let provider, signer, contract, userAddress;

function noMetaMask() {
        if (!window.ethereum) {
        alert('MetaMask is required to proceed. Please install MetaMask.');
    } 
}

async function initialize() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        const metaMaskLogo = document.getElementById('loginLogoM');
        
        try {
            //zatrazi konekciju za metamask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length > 0) {
                userAddress = accounts[0];
                metaMaskLogo.style.display = 'none';
                document.getElementById('loginButton').style.display = 'none';

                //provjerava da li je user admin
                const isAdmin = await contract.owner();
                if (isAdmin.toLowerCase() === userAddress.toLowerCase()) {
                    document.getElementById('ownerSection').classList.remove('hidden');
                    loadAdminCampaigns();
                } else {
                    document.getElementById('donationSection').classList.remove('hidden');
                    loadDonorCampaigns();
                }
            }
        } catch (error) {
            metaMaskLogo.style.display = 'block';
            console.error('Error connecting to MetaMask:', error);
            alert("MetaMask connection failed. Make sure you are using your Sepolia Testnet account.");
            
            //ostavlja button nakon errora kada se ne koristi sepolia account i centrira ga
            const button = document.getElementById('loginButton');
            button.style.display = 'block';
            button.style.margin = '0 auto';
            button.style.textAlign = 'center';
        }
    } /*else {
        //If MetaMask is not installed, alert the user
        alert("MetaMask is not installed. Please install MetaMask to continue.");
    } */
    
}

async function checkMetaMaskConnection() {
    try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            userAddress = accounts[0];
            document.getElementById('loginButton').style.display = 'none';

            const isAdmin = await contract.owner();
            if (isAdmin.toLowerCase() === userAddress.toLowerCase()) {
                document.getElementById('ownerSection').classList.remove('hidden');
                loadAdminCampaigns();
            } else {
                document.getElementById('donationSection').classList.remove('hidden');
                loadDonorCampaigns();
            }
        }
    } catch (error) {
        console.error('Error checking MetaMask connection:', error);
    }
}

async function loadAdminCampaigns() {
    try {
        const totalCampaigns = await contract.totalCampaigns();
        const container = document.getElementById('campaignList');
        container.innerHTML = '';

        for (let i = 0; i < totalCampaigns; i++) {
            const campaign = await contract.getCampaignDetails(i);
            const card = document.createElement('div');
            card.className = 'card mb-3';

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${campaign.name}</h5>
                    <p class="card-text">${campaign.description}</p>
                    <p><strong>Goal:</strong> ${ethers.utils.formatEther(campaign.goal)} ETH</p>
                    <p><strong>Collected:</strong> ${ethers.utils.formatEther(campaign.collected)} ETH</p>
                    <p><strong>Status:</strong> ${campaign.isActive ? 'Active' : 'Closed'}</p>
                    ${campaign.isActive ? `<button class="btn btn-danger" onclick="closeCampaign(${i})">Close Campaign</button>` : ''}
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

async function loadDonorCampaigns() {
    try {
        const activeCampaigns = await contract.getActiveCampaigns();
        const container = document.getElementById('activeCampaigns');
        container.innerHTML = '';

        activeCampaigns.forEach(async (id) => {
            const campaign = await contract.getCampaignDetails(id);
            const card = document.createElement('div');
            card.className = 'card mb-3';

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${campaign.name}</h5>
                    <p class="card-text">${campaign.description}</p>
                    <p><strong>Goal:</strong> ${ethers.utils.formatEther(campaign.goal)} ETH</p>
                    <p><strong>Collected:</strong> ${ethers.utils.formatEther(campaign.collected)} ETH</p>
                    <input type="number" placeholder="Enter amount in ETH" class="form-control mb-2" id="donationInput${id}">
                    <button class="btn btn-primary" onclick="donate(${id})" style="background-color: #391461;">Donate</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading active campaigns:', error);
    }
}

async function createCampaign() {
    const name = prompt("Enter the campaign name:");
    if (!name) {
        alert("Campaign name is required.");
        return;
    }

    const description = prompt("Enter the campaign description:");
    if (!description) {
        alert("Campaign description is required.");
        return;
    }

    const goal = prompt("Enter the campaign goal in ETH:");
    if (!goal || parseFloat(goal) <= 0) {
        alert("Please enter a valid goal in ETH.");
        return;
    }

    try {
        const goalInWei = ethers.utils.parseEther(goal);
        const tx = await contract.createCampaign(name, description, goalInWei);
        await tx.wait();
        alert("Campaign created successfully!");
        loadAdminCampaigns();
    } catch (error) {
        console.error("Error creating campaign:", error);
        alert("Failed to create campaign.");
    }
}

async function closeCampaign(campaignId) {
    try {
        const tx = await contract.closeCampaign(campaignId);
        await tx.wait();
        alert('Campaign closed successfully!');
        loadAdminCampaigns();
    } catch (error) {
        console.error('Error closing campaign:', error);
        alert('Failed to close campaign.');
    }
}

async function donate(campaignId) {
    const amount = document.getElementById(`donationInput${campaignId}`).value;
    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount in ETH.');
        return;
    }

    try {
        const tx = await contract.donate(campaignId, {
            value: ethers.utils.parseEther(amount),
        });
        await tx.wait();
        alert('Thank you for your donation!');
        loadDonorCampaigns();
    } catch (error) {
        console.error('Error making donation:', error);
        alert('Donation failed.');
    }
}

async function loadAdminCampaigns() {
    try {
        const totalCampaigns = await contract.totalCampaigns();
        const container = document.getElementById('campaignList');
        container.innerHTML = '';

        for (let i = 0; i < totalCampaigns; i++) {
            const campaign = await contract.getCampaignDetails(i);
            const donations = await contract.getDonations(i);
            const card = document.createElement('div');
            card.className = 'card mb-3';

            //lista donacija
            let donationListHTML = '<ul>';
            donations.forEach(donation => {
                donationListHTML += `
                    <li>
                        Donor: ${donation.donor} | Amount: ${ethers.utils.formatEther(donation.amount)} ETH | Timestamp: ${new Date(donation.timestamp * 1000).toLocaleString()}
                    </li>`;
            });
            donationListHTML += '</ul>';

            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${campaign.name}</h5>
                    <p class="card-text">${campaign.description}</p>
                    <p><strong>Goal:</strong> ${ethers.utils.formatEther(campaign.goal)} ETH</p>
                    <p><strong>Collected:</strong> ${ethers.utils.formatEther(campaign.collected)} ETH</p>
                    <p><strong>Status:</strong> ${campaign.isActive ? 'Active' : 'Closed'}</p> 
                    ${campaign.isActive ? `<button class="btn btn-danger" onclick="closeCampaign(${i})">Close Campaign</button>` : ''}
                    ${campaign.isActive ? `<button class="btn btn-warning" onclick="editCampaign(${i})">Edit Campaign</button>` : ''} 
                    <div class="mt-3"></div>
                    <h6>Donations:</h6> 
                    ${donationListHTML}
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}


async function editCampaign(campaignId) {
    const campaign = await contract.getCampaignDetails(campaignId);

    //opcija za admina da edituje kampanju
    const newName = prompt("Enter the new campaign name:", campaign.name);
    if (newName === null || newName === "") return;  //u slucaju otkazivanja edita ili ako se ne unese ime

    const newDescription = prompt("Enter the new campaign description:", campaign.description);
    if (newDescription === null || newDescription === "") return;  //u slucaju otkazivanja edita ili ako se ne unese description

    const newGoal = prompt("Enter the new campaign goal in ETH:", ethers.utils.formatEther(campaign.goal));
    if (newGoal === null || parseFloat(newGoal) <= 0) {
        alert("Please enter a valid goal in ETH.");
        return;
    }

    try {
        const newGoalInWei = ethers.utils.parseEther(newGoal);
        const tx = await contract.editCampaign(campaignId, newName, newDescription, newGoalInWei);
        await tx.wait();
        alert("Campaign updated successfully!");
        loadAdminCampaigns();
    } catch (error) {
        console.error('Error editing campaign:', error);
        alert('Failed to edit campaign.');
    }
}


document.getElementById('loginButton').addEventListener('click', initialize);
document.getElementById('createCampaignButton').addEventListener('click', createCampaign);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('loginButton').addEventListener('click', noMetaMask);
});