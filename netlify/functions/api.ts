import serverless from 'serverless-http';
import app from '../../server';

const serverlessHandler = serverless(app, {
  provider: 'aws'
});

export const handler = async (event: any, context: any) => {
  console.log(`[Netlify Function] Handling request: ${event.httpMethod} ${event.path}`);
  return await serverlessHandler(event, context);
};
