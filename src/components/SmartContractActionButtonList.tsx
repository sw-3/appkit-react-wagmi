//
// if you are not going to read or write smart contract, you can delete this file
//

import { useAppKitNetwork, useAppKitAccount  } from '@reown/appkit/react'
import { useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { useEffect, useState } from 'react'
import { erc20Abi, formatUnits } from 'viem'
const storageABI = [
	{
		"inputs": [],
		"name": "retrieve",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

const storageSC = "0xEe6D291CC60d7CeD6627fA4cd8506912245c8cA4"
const SW3ca = "0x9f5F9EbBda30279E0cfE80C92269a034C636D51f"

export const SmartContractActionButtonList = () => {
    const { address: loggedInWalletAddress, isConnected } = useAppKitAccount() // AppKit hook to get the address and check if the user is connected
    const { chainId } = useAppKitNetwork()
    const { writeContract, isSuccess } = useWriteContract()

    const [isLoading, setIsLoading] = useState(true)
    const [formattedBalance, setFormattedBalance] = useState(null)
    const [tokenSymbol, setTokenSymbol] = useState(null)

    const readContract = useReadContract({
      address: storageSC,
      abi: storageABI,
      functionName: 'retrieve',
      query: {
        enabled: false, // disable the query in onload
      }
    })

    const readSW3Balance = useReadContracts({
      allowFailure: false,
      contracts: [
        {
          address: SW3ca,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [loggedInWalletAddress],
          query: {
            enabled: false, // disable the query in onload
          },
        },
        {
          address: SW3ca,
          abi: erc20Abi,
          functionName: 'decimals',
          query: {
            enabled: false, // disable the query in onload
          },
        },
        {
          address: SW3ca,
          abi: erc20Abi,
          functionName: 'symbol',
          query: {
            enabled: false, // disable the query in onload
          },
        },
      ]
    })

    const loadSW3Data = async () => {
      const { data } = await readSW3Balance.refetch();
      const balance = formatUnits(data[0], data[1]);
      setFormattedBalance(balance);
      setTokenSymbol(data[2]);
      console.log("Balance set in loadSW3Data.");

      setIsLoading(false);
    }

    useEffect(() => {
      if (isSuccess) {
        console.log("contract write success");
      }
      if (isLoading) {
        loadSW3Data();
      }
    }, [isSuccess, isLoading])

    const handleReadSmartContract = async () => {
      console.log("Read Sepolia Smart Contract");
      const { data } = await readContract.refetch();
      console.log("data: ", data)
    }

    const handleReadSW3Balance = async () => {
      console.log("Read SW3 token balance.");
      const { data } = await readSW3Balance.refetch();
      const output = formatUnits(data[0], data[1]);
      console.log("Balance: ", output, data[2]);
    }

    const handleWriteSmartContract = () => {
        console.log("Write Sepolia Smart Contract")
        writeContract({
          address: storageSC,
          abi: storageABI,
          functionName: 'store',
          args: [123n],
        })
    }

  return (
    isConnected && chainId === 11155111 && !isLoading && ( // Only show the buttons if the user is connected to Sepolia
      <div>
        <button onClick={handleReadSmartContract}>Read Sepolia Smart Contract</button>
        <button onClick={handleReadSW3Balance}>Read SW3 Token Balance</button>
        <button onClick={handleWriteSmartContract}>Write Sepolia Smart Contract</button>
        <br />
        Balance: {formattedBalance} {tokenSymbol}
      </div>
    )
  )
}
