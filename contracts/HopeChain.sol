// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HopeChain {
    address public owner;

    struct Campaign {
        string name;
        string description;
        address payable owner;
        uint256 goal;
        uint256 collected;
        bool isActive;
    }

    struct Donation {
        uint256 campaignId;
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public donations;
    uint256 public totalCampaigns;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    modifier onlyCampaignOwner(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].owner, "Only campaign owner can call this function");
        _;
    }

    modifier validCampaignId(uint256 campaignId) {
        require(campaignId < totalCampaigns, "Invalid campaign ID");
        _;
    }

    event CampaignCreated(uint256 campaignId, string name, uint256 goal, address campaignOwner);
    event DonationReceived(uint256 campaignId, address donor, uint256 amount, uint256 timestamp);
    event CampaignClosed(uint256 campaignId, uint256 collected, bool goalReached);
    event CampaignEdited(uint256 campaignId, string newName, string newDescription, uint256 newGoal);

    constructor() {
        owner = msg.sender;
    }

    function createCampaign(string memory _name, string memory _description, uint256 _goal) external {
        require(_goal > 0, "Goal must be greater than zero");

        uint256 campaignId = totalCampaigns++;
        campaigns[campaignId] = Campaign({
            name: _name,
            description: _description,
            owner: payable(msg.sender),
            goal: _goal,
            collected: 0,
            isActive: true
        });

        emit CampaignCreated(campaignId, _name, _goal, msg.sender);
    }

    function donate(uint256 campaignId) external payable validCampaignId(campaignId) {
        require(campaigns[campaignId].isActive, "Campaign is not active");
        require(msg.value > 0, "Donation must be greater than zero");

        Campaign storage campaign = campaigns[campaignId];
        campaign.collected += msg.value;

        donations[campaignId].push(Donation({
            campaignId: campaignId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit DonationReceived(campaignId, msg.sender, msg.value, block.timestamp);
    }

    function closeCampaign(uint256 campaignId) external onlyCampaignOwner(campaignId) validCampaignId(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.isActive, "Campaign is already closed");

        campaign.isActive = false;

        bool goalReached = campaign.collected >= campaign.goal;
        if (goalReached) {
            campaign.owner.transfer(campaign.collected);
        }

        emit CampaignClosed(campaignId, campaign.collected, goalReached);
    }

    function getCampaignDetails(uint256 campaignId)
        external
        view
        validCampaignId(campaignId)
        returns (
            string memory name,
            string memory description,
            address campaignOwner,
            uint256 goal,
            uint256 collected,
            bool isActive
        )
    {
        Campaign storage campaign = campaigns[campaignId];
        return (campaign.name, campaign.description, campaign.owner, campaign.goal, campaign.collected, campaign.isActive);
    }

    function getDonations(uint256 campaignId) external view validCampaignId(campaignId) returns (Donation[] memory) {
        return donations[campaignId];
    }

    function getActiveCampaigns() external view returns (uint256[] memory activeCampaignIds) {
        uint256 count = 0;

        for (uint256 i = 0; i < totalCampaigns; i++) {
            if (campaigns[i].isActive) {
                count++;
            }
        }

        activeCampaignIds = new uint256[](count);
        count = 0;

        for (uint256 i = 0; i < totalCampaigns; i++) {
            if (campaigns[i].isActive) {
                activeCampaignIds[count] = i;
                count++;
            }
        }

        return activeCampaignIds;
    }

    
    function editCampaign(uint256 campaignId, string memory newName, string memory newDescription, uint256 newGoal)
        external
        onlyCampaignOwner(campaignId)
        validCampaignId(campaignId)
    {
        require(newGoal > 0, "Goal must be greater than zero");

        Campaign storage campaign = campaigns[campaignId];
        campaign.name = newName;
        campaign.description = newDescription;
        campaign.goal = newGoal;

        emit CampaignEdited(campaignId, newName, newDescription, newGoal);
    }
}
