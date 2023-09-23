import { run } from 'hardhat';

const verify = async (address: string) => {
  try {
    console.log('Verifying...');
    await run('verify:verify', {
      address,
    });
    console.log('Verify Successed');
  } catch (e) {
    console.log(e);
  }
};

export default verify;
