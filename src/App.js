import React, { useState, useEffect } from "react";
import Web3 from "web3";
import contractABI from "./abi.json"; // Importing ABI from JSON file
import "./App.css";

const tokenAddress = "0x006936a7435bD0aF9B27473579ac7A90F4D74b37"; // Replace with your actual token address

const App = () => {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]); 
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0); // Default to first account
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState(""); // State for staking amount
  const [withdrawAmount, setWithdrawAmount] = useState(""); // State for withdrawing staked amount
  const [multiSendRecipients, setMultiSendRecipients] = useState([]); // State for multi-send recipients
  const [multiSendAmounts, setMultiSendAmounts] = useState([]); // State for multi-send amounts

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };
    loadWeb3();
  }, []);



  const handleTransfer = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      await contract.methods
        .transfer(recipient, amount)
        .send({ from: accounts[selectedAccountIndex] });
      alert("Transfer successful");
    } catch (error) {
      console.error("Error during the transfer", error);
      alert("Transfer failed");
    }
  };

  const handleMint = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
  
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI
  
    try {
      const owner = await contract.methods.owner().call(); // Get the owner address from the contract
      if (accounts[selectedAccountIndex] !== owner) { // Check if the current account is not the owner
        alert("Only the owner account can mint tokens"); // Show alert warning for non-owner accounts
        return; // Exit the function
      }
  
      await contract.methods.mint(mintAmount).send({ from: accounts[selectedAccountIndex] });
      alert("Minting successful");
    } catch (error) {
      console.error("Error during minting", error);
      alert("Minting failed");
    }
  };
  

  const handleBurn = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      const owner = await contract.methods.owner().call(); // Get the owner address from the contract
      if (accounts[selectedAccountIndex] !== owner) { // Check if the current account is not the owner
        alert("Only the owner account can mint tokens"); // Show alert warning for non-owner accounts
        return; // Exit the function
      }

      // Fetch the user's token balance
      const userBalance = await contract.methods.balanceOf(accounts[selectedAccountIndex]).call();

      // Check if the amount to burn exceeds the user's balance
      if (parseInt(burnAmount) > parseInt(userBalance)) {
          // Display a warning alert if the amount to burn exceeds the user's balance
          alert('You cannot burn more tokens than you currently hold.');
          return;
      }

      await contract.methods.burn(burnAmount).send({ from: accounts[selectedAccountIndex] });
      alert("Burning successful");
    } catch (error) {
      console.error("Error during burning", error);
      alert("Burning failed");
    }
  };

  const handlePause = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      await contract.methods.pause().send({ from: accounts[selectedAccountIndex] });
      alert("Contract paused");
    } catch (error) {
      console.error("Error pausing contract", error);
      alert("Failed to pause contract");
    }
  };

  const handleUnpause = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      await contract.methods.unpause().send({ from: accounts[selectedAccountIndex] });
      alert("Contract unpaused");
    } catch (error) {
      console.error("Error unpausing contract", error);
      alert("Failed to unpause contract");
    }
  };

  const handleStake = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      await contract.methods.stake(stakeAmount).send({ from: accounts[selectedAccountIndex] });
      alert("Staking successful");
    } catch (error) {
      console.error("Error during staking", error);
      alert("Staking failed");
    }
  };

  const handleWithdraw = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
    const contract = new web3.eth.Contract(contractABI, tokenAddress); // Using imported ABI

    try {
      await contract.methods
        .withdraw(withdrawAmount)
        .send({ from: accounts[selectedAccountIndex] });
      alert("Withdrawal successful");
    } catch (error) {
      console.error("Error during withdrawal", error);
      alert("Withdrawal failed");
    }
  };

  const handleMultiSend = async () => {
    if (!web3 || !accounts[selectedAccountIndex]) return;
  
    // Convert recipient addresses to proper format
    const recipients = multiSendRecipients.map(address => address.trim());
    console.log(recipients);
  
    // Convert amounts to integers
    const amounts = multiSendAmounts.map(amount => parseInt(amount));
  
    const contract = new web3.eth.Contract(contractABI, tokenAddress);
  
    try {

       // Check if the contract is paused
       const isPaused = await contract.methods.paused().call();
       if (isPaused) {
           alert("Contract is paused. Multi-send operation cannot be executed.");
           return;
       }

      await contract.methods
        .multiSend(recipients, amounts)
        .send({ from: accounts[selectedAccountIndex] });
  
      alert("Multi-send successful");
      // Clear input fields after successful multi-send
      setMultiSendRecipients([]);
      setMultiSendAmounts([]);
    } catch (error) {
      console.error("Error during multi-send", error);
      alert("Multi-send failed");
    }
  };
  

  return (
    <div>
      <select value={selectedAccountIndex} onChange={(e) => setSelectedAccountIndex(e.target.value)}>
                {accounts.map((account, index) => (
                    <option key={index} value={index}>Account {index + 1}</option>
                ))}
            </select>
      <div className="transfer-section">
        <h2>Transfer Tokens</h2>
        <input
          className="transfer-input"
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="transfer-input"
          type="text"
          placeholder="Amount to Transfer"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="transfer-button" onClick={handleTransfer}>
          Transfer
        </button>
      </div>

      <div className="mint-tokens-container">
        <h2>Mint Tokens</h2>
        <input
          type="text"
          placeholder="Amount to Mint"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />
        <button onClick={handleMint}>Mint</button>
      </div>

      <div className="burn-tokens-container">
        <h2>Burn Tokens</h2>
        <input
          type="text"
          placeholder="Amount to Burn"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
        />
        <button onClick={handleBurn}>Burn</button>
      </div>

      <div className="pause-unpause-container">
  <button onClick={handlePause}>Pause Contract</button>
  <button onClick={handleUnpause}>Unpause Contract</button>
</div>


<div>
        <h2>Stake Tokens</h2>
        <div className="stake-tokens-container">
            <input
                className="stake-input"
                type="text"
                placeholder="Amount to Stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
            />
            <button className="stake-button" onClick={handleStake}>Stake</button>
        </div>
    </div>

      <div className="withdraw-section">
  <h2>Withdraw Staked Tokens</h2>
  {/* Input field for amount to withdraw */}
  <input
    type="text"
    placeholder="Amount to Withdraw"
    value={withdrawAmount}
    onChange={(e) => setWithdrawAmount(e.target.value)}
  />
  {/* Button to initiate withdrawal */}
  <button onClick={handleWithdraw}>Withdraw</button>
</div>

<div className="multi-send-section">
      <h2>Multi-Send Tokens</h2>
      <div>
        {multiSendRecipients.map((recipient, index) => (
          <div className="multi-send-input-container" key={index}>
            <input
              type="text"
              placeholder={`Recipient Address ${index + 1}`}
              value={recipient}
              onChange={(e) => {
                const updatedRecipients = [...multiSendRecipients];
                updatedRecipients[index] = e.target.value;
                setMultiSendRecipients(updatedRecipients);
              }}
            />
            <input
              type="text"
              placeholder={`Amount ${index + 1}`}
              value={multiSendAmounts[index]}
              onChange={(e) => {
                const updatedAmounts = [...multiSendAmounts];
                updatedAmounts[index] = e.target.value;
                setMultiSendAmounts(updatedAmounts);
              }}
            />
          </div>
        ))}
        <button className="ar-button"
          onClick={() => {
            setMultiSendRecipients([...multiSendRecipients, ""])
            setMultiSendAmounts([...multiSendAmounts, ""])
          }}
        >
          Add Recipient
        </button>

      </div>
      <button className="green-button" onClick={handleMultiSend}>Multi-Send</button>

    </div>
    </div>
  );
};

export default App;
