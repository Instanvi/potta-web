import axios from '../../../../config/axios.config';

export async function getMe() {
  const res = await axios.get('/whoami');
  return res.data;
} 