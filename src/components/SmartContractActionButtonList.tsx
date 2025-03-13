//
// if you are not going to read or write smart contract, you can delete this file
//
// Added example of reading an erc20 token balance and displaying on the screen.
//   - the useReadContracts hook is required, since useBalance no longer supports
//     the "token" argument in Wagmi.
//

import { useAppKitNetwork, useAppKitAccount  } from '@reown/appkit/react'
import { useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { useEffect, useState } from 'react'

// Viem imports; ABI for erc20 contract, and format the balance
import { erc20Abi, formatUnits } from 'viem'

// original Reown ABI for custom contract
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

// original custom test contract on Sepolia
const storageSC = "0xEe6D291CC60d7CeD6627fA4cd8506912245c8cA4"

// ERC20 test token on Sepolia
const SW3ca = "0x9f5F9EbBda30279E0cfE80C92269a034C636D51f"

export const SmartContractActionButtonList = () => {
    // AppKit hooks to get wallet, connection status, network ID
    const { address: loggedInWalletAddress, isConnected } = useAppKitAccount()
    const { chainId } = useAppKitNetwork()

    const { writeContract, isSuccess } = useWriteContract()

    // React state variables
    //   - isLoading defaults to true, until balance and symbol have been loaded
    const [isLoading, setIsLoading] = useState(true)
    const [formattedBalance, setFormattedBalance] = useState(null)
    const [tokenSymbol, setTokenSymbol] = useState(null)

    // original Reown example of custom smart contract read
    const readContract = useReadContract({
      address: storageSC,
      abi: storageABI,
      functionName: 'retrieve',
      query: {
        enabled: false, // disable the query in onload
      }
    })

    // function to read the erc20 token's balance, decimals & symbol
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

    // handler function to read the SW3 token data into the state
    const loadSW3Data = async () => {
      const { data } = await readSW3Balance.refetch();
      const balance = formatUnits(data[0], data[1]);
      setFormattedBalance(balance);
      setTokenSymbol(data[2]);
      console.log("Balance set in loadSW3Data.");

      // set isLoading false to prevent reading again
      setIsLoading(false);
    }

    useEffect(() => {
      if (isSuccess) {
        console.log("contract write success");
      }
      // this triggers the initial read of the SW3 token balance
      if (isLoading) {
        loadSW3Data();
      }
    }, [isSuccess, isLoading])

    // button handlers
    const handleReadSmartContract = async () => {
      console.log("Read Sepolia Smart Contract");
      const { data } = await readContract.refetch();
      console.log("data: ", data)
    }

    // example of a button which will trigger a read of the balance also
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

  // SW3 balance and symbol are now displayed on the page
  return (
    isConnected && chainId === 11155111 && !isLoading && ( // Only show this if Sepolia
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
