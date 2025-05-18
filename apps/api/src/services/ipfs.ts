import { create } from 'kubo-rpc-client';
import { IPFS_URL, PINATA_JWT } from '../config.js';

// Connect to local IPFS node
const ipfs = create({ url: IPFS_URL });

// If configured, add Pinata as a remote pinning service
const setupRemotePinning = async () => {
  if (!PINATA_JWT) return;

  try {
    // Check if service already exists
    const services = await ipfs.pin.remote.service.ls();
    const pinataService = services.find((s) => s.service === 'pinata');

    if (!pinataService) {
      // Add Pinata as remote pinning service if not already added
      await ipfs.pin.remote.service.add('pinata', {
        endpoint: new URL('https://api.pinata.cloud/psa'),
        key: PINATA_JWT,
      });
    }
  } catch (error) {
    console.error('Error setting up remote pinning:', error);
  }
};

// Initialize remote pinning on startup
setupRemotePinning();

// Get content from local IPFS node
const get = async (cid: string) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return new TextDecoder().decode(Buffer.concat(chunks));
  } catch (error) {
    console.error('IPFS retrieve error', error);
    return null;
  }
};

// Add content to local IPFS node
const put = async (id: string, content: string) => {
  try {
    const { cid } = await ipfs.add(content);
    const cidString = cid.toString();

    if (PINATA_JWT)
      await ipfs.pin.remote.add(cid, {
        service: 'pinata',
        name: id,
      });

    return cidString;
  } catch (error) {
    console.error('IPFS upload error', error);
    return null;
  }
};

export default {
  ipfs,
  get,
  put,
};
