import { ethers, network } from 'hardhat';
import { getNamedAccounts } from 'hardhat';
import { FundMe } from '../../typechain-types';
import { developmentChains } from '../../const';
import { expect } from 'chai';

developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async function () {
          let fundMe: FundMe;
          let deployer;
          let contractAddress;
          const sendValue = ethers.parseEther('0.01');
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract('FundMe', deployer);
          });

          it('allows people to fund and withdraw', async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const provider = ethers.provider;
              contractAddress = await fundMe.getAddress();
              const endingBalance = await provider.getBalance(contractAddress);
              expect(endingBalance).equal(0);
          });
      });
