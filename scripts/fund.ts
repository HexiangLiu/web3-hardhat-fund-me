import { ethers, deployments, getNamedAccounts } from 'hardhat';
import { FundMe } from '../typechain-types';

const main = async () => {
    const deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(['fundMe']);
    const fundMe: FundMe = await ethers.getContract('FundMe', deployer);
    console.log('Funding Contract...');
    const res = await fundMe.fund({
        value: ethers.parseEther('0.1'),
    });
    await res.wait(1);
    console.log('Funded!');
};

main()
    .then(() => process.exit())
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
