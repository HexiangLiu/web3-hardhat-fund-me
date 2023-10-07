import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

const main = async () => {
    const deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(['fundMe']);
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer);
    console.log('Withdraw Contract...');
    const res = await fundMe.withdraw();
    await res.wait(1);
    console.log('Withdrawed!');
};

main()
    .then(() => process.exit())
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
