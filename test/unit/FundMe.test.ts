import { deployments, ethers } from 'hardhat';
import { expect } from 'chai';
import { FundMe, MockV3Aggregator } from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { Address } from 'hardhat-deploy/dist/types';

describe('FundMe', () => {
    let fundMe: FundMe;
    let mockV3Aggregator: MockV3Aggregator;
    let deployer: HardhatEthersSigner;
    const sendValue = ethers.parseEther('1');
    beforeEach(async () => {
        deployer = (await ethers.getSigners())[0];
        await deployments.fixture(['fundMe']);
        fundMe = await ethers.getContract('FundMe', deployer);
        mockV3Aggregator = await ethers.getContract(
            'MockV3Aggregator',
            deployer,
        );
    });
    describe('constructor', () => {
        it('sets the aggregator address correctly', async () => {
            const priceFeedAddress = await fundMe.priceFeed();
            const aggreatorAddress = await mockV3Aggregator.getAddress();
            expect(priceFeedAddress).equal(aggreatorAddress);
        });
    });

    describe('fund', () => {
        it('fund failed when not enough money', async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                'You need to spend more ETH!',
            );
        });
        it('funded when send enough money', async () => {
            await fundMe.fund({
                value: sendValue,
            });
            const res = await fundMe.addressToAmountFunded(deployer.address);
            expect(res).equal(sendValue);
        });
        it('records funder to array of funders', async () => {
            await fundMe.fund({
                value: sendValue,
            });
            const funder = await fundMe.funders(0);
            expect(funder).equal(deployer.address);
        });
    });

    describe('withdraw', async () => {
        let contractAddress: Address;
        beforeEach(async () => {
            await fundMe.fund({
                value: sendValue,
            });
            contractAddress = await fundMe.getAddress();
        });
        it('withdraw ETH from a single founder', async () => {
            const provider = ethers.provider;
            const preContractBalance =
                await provider.getBalance(contractAddress);
            const preDeployerBalance = await provider.getBalance(
                deployer.address,
            );
            const transcation = await fundMe.withdraw();
            const transcationRecepit = await transcation.wait(1);
            // @ts-ignore
            const { gasUsed, gasPrice } = transcationRecepit;
            const gasCost = gasPrice * gasUsed;
            const curContractBalance =
                await provider.getBalance(contractAddress);
            const curFunderBalance = await provider.getBalance(
                deployer.address,
            );
            expect(curContractBalance).equal(0);
            expect(preContractBalance + preDeployerBalance).equal(
                // @ts-ignore
                curFunderBalance + gasCost,
            );
        });
        it('withdraw ETH from multiple founders', async () => {
            const provider = ethers.provider;
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const connectedContract = await fundMe.connect(accounts[i]);
                await connectedContract.fund({ value: sendValue });
            }
            const preContractBalance =
                await provider.getBalance(contractAddress);
            const preDeployerBalance = await provider.getBalance(
                deployer.address,
            );
            const transcation = await fundMe.withdraw();
            const transcationRecepit = await transcation.wait(1);
            // @ts-ignore
            const { gasUsed, gasPrice } = transcationRecepit;
            const gasCost = gasPrice * gasUsed;
            const curContractBalance =
                await provider.getBalance(contractAddress);
            const curDeployerBalance = await provider.getBalance(
                deployer.address,
            );
            expect(curContractBalance).equal(0);
            expect(preContractBalance + preDeployerBalance).equal(
                // @ts-ignore
                curDeployerBalance + gasCost,
            );
            await expect(fundMe.funders(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
                expect(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                ).equal(0);
            }
        });
        it('only allows the owner to withdraw', async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const connectedContract = await fundMe.connect(attacker);
            await expect(
                connectedContract.withdraw(),
            ).to.be.revertedWithCustomError(
                connectedContract,
                'FundMe__NotOwner',
            );
        });
    });
});
