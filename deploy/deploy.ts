import { HardhatRuntimeEnvironment } from 'hardhat/types';
import 'dotenv/config';
import verify from '../utils/verify';
import { netWorkConfig } from '../const';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, getChainId } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    let priceFeedAddress = netWorkConfig[chainId]?.ethUsdPriceFeedAddress;
    if (!priceFeedAddress) {
        priceFeedAddress = (await deployments.get('MockV3Aggregator')).address;
    }
    const result = await deploy('FundMe', {
        from: deployer,
        gasLimit: 4000000,
        args: [priceFeedAddress],
        log: true,
        waitConfirmations: netWorkConfig[chainId] ? 3 : 1,
    });

    if (netWorkConfig[chainId] && process.env.ETHERSCAN_API_KEY) {
        await verify(result.address);
    }
};

deploy.tags = ['fundMe'];
deploy.dependencies = ['mock'];

export default deploy;
