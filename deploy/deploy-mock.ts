import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { netWorkConfig, DECIMALS, INITIAL_ANSWER } from '../const';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, getChainId } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    const priceFeedAddress = netWorkConfig[chainId]?.ethUsdPriceFeedAddress;

    if (!priceFeedAddress) {
        log('Local network detected');
        await deploy('MockV3Aggregator', {
            from: deployer,
            gasLimit: 4000000,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        });
        log('Mocks deployed');
        log('----------------------------------');
    }
};

deploy.tags = ['mock'];

export default deploy;
