import { octokit } from './index.ts';

export const getIssue = async ({
  owner,
  repo,
  issue_number,
}: {
  owner: string;
  repo: string;
  issue_number: number;
}) => {
  try {
    return await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number,
    });
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
};

export const updateIssue = async ({
  owner,
  repo,
  issue_number,
  body,
}: {
  owner: string;
  repo: string;
  issue_number: number;
  body: string;
}) => {
  try {
    return await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number,
      body,
    });
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
};
