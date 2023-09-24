import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-ethers';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@nomicfoundation/hardhat-toolbox';
import 'solidity-coverage';
import 'dotenv/config';

const config: HardhatUserConfig = {
    solidity: '0.8.19',
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545/',
            accounts: [
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            ],
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.SEPOLIA_PRIVATE_KEY!],
            chainId: 11155111,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enabled: false,
        currency: 'USD',
        coinmarketcap: process.env.COINMARKET_API_KEY,
        outputFile: 'gas-report.txt',
        noColors: true,
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};

export default config;
