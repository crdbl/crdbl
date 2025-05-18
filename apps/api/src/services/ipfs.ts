import { create } from 'kubo-rpc-client';
import { IPFS_URL } from '../config.js';

// Connect to local IPFS node
const ipfs = create({ url: IPFS_URL });

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
