// deploy.js

const hre = require("hardhat");

async function main() {
  const hopeChain = await hre.ethers.deployContract("HopeChain");

  await hopeChain.waitForDeployment();

  console.log(`HopeChain contract deployed to ${hopeChain.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
