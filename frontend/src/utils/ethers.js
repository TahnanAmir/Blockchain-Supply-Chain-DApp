import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./config";

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  // ethers v6 provider
  const provider = new ethers.BrowserProvider(window.ethereum);

  // ask wallet connection (only once)
  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export const AMOY_GAS = {
  maxFeePerGas:         ethers.parseUnits("35", "gwei"),
  maxPriorityFeePerGas: ethers.parseUnits("25", "gwei"),
};
 