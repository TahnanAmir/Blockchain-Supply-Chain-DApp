async function main() {
  const SupplyChain = await ethers.getContractFactory("MuhammadTahnanAamir_SupplyChain");

  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();

  console.log("Contract deployed to:", await supplyChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});