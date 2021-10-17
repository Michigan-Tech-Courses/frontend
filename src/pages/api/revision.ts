import type {NextApiRequest, NextApiResponse} from 'next';

const handler = (request: NextApiRequest, response: NextApiResponse) => {
	response.send(process.env.NEXT_PUBLIC_GIT_REVISION);
};

export default handler;
