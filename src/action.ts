import { debug, getInput, notice } from '@actions/core';
import { z } from 'zod';

import { Bugzilla } from './bugzilla';
import { Config } from './config';
import { Controller } from './controller';
import { Jira } from './jira';
import { CustomOctokit } from './octokit';
import { PullRequestMetadata } from './schema/input';
import {
  getFailedMessage,
  getSuccessMessage,
  raise,
  removeLabel,
  setLabels,
} from './util';

async function action(
  octokit: CustomOctokit,
  owner: string,
  repo: string,
  prMetadata: PullRequestMetadata
): Promise<string> {
  const trackerType = getInput('tracker-type', { required: true });
  const config = await Config.getConfig(octokit);

  let trackerController: Controller<Bugzilla | Jira>;

  switch (trackerType) {
    case 'bugzilla':
      const bzInstance = getInput('bugzilla-instance', { required: true });
      const bzAPIToken = getInput('bugzilla-api-token', { required: true });

      trackerController = new Controller(new Bugzilla(bzInstance, bzAPIToken));
      debug(
        `Using Bugzilla '${bzInstance}', version: '${await trackerController.adapter.getVersion()}'`
      );
      break;

    case 'jira':
      const jiraInstance = getInput('jira-instance', { required: true });
      const jiraAPIToken = getInput('jira-api-token', { required: true });

      trackerController = new Controller(new Jira(jiraInstance, jiraAPIToken));
      debug(
        `Using Jira '${jiraInstance}', version: '${await trackerController.adapter.getVersion()}'`
      );
      break;

    default:
      setLabels(octokit, owner, repo, prMetadata.number, [
        config.labels['missing-tracker'],
      ]);
      raise(`Missing tracker or Unknown tracker type: '${trackerType}'`);
  }

  let message: string[] = [];
  let err: string[] = [];
  let labels: { add: string[]; remove: string[] } = { add: [], remove: [] };

  const labelsFromPR = z
    .array(z.object({ name: z.string() }).transform(label => label.name))
    .parse(
      (
        await octokit.request(
          'GET /repos/{owner}/{repo}/issues/{issue_number}/labels',
          {
            owner,
            repo,
            issue_number: prMetadata.number,
          }
        )
      ).data
    );

  const tracker = getInput('tracker', { required: true });

  const issueDetails = await trackerController.adapter.getIssueDetails(tracker);

  const isMatchingProduct = trackerController.adapter.isMatchingProduct(
    config.products
  );
  if (!isMatchingProduct) {
    labels.add.push(config.labels['invalid-product']);
    err.push(
      `🔴 Tracker ${trackerController.adapter.getMarkdownUrl()} has product \`${
        issueDetails.product
      }\` but desired product is one of \`${config.products}\``
    );
  } else {
    if (labelsFromPR.includes(config.labels['invalid-product'])) {
      removeLabel(
        octokit,
        owner,
        repo,
        prMetadata.number,
        config.labels['invalid-product']
      );
    }
    message.push(
      `🟢 Tracker ${trackerController.adapter.getMarkdownUrl()} has set desired product: \`${
        issueDetails.product
      }\``
    );
  }

  const component = getInput('component', { required: true });

  const isMatchingComponent =
    trackerController.adapter.isMatchingComponent(component);
  if (!isMatchingComponent) {
    labels.add.push(config.labels['invalid-component']);
    err.push(
      `🔴 Tracker ${trackerController.adapter.getMarkdownUrl()} has component \`${
        issueDetails.component
      }\` but desired component is \`${component}\``
    );
  } else {
    if (labelsFromPR.includes(config.labels['invalid-component'])) {
      removeLabel(
        octokit,
        owner,
        repo,
        prMetadata.number,
        config.labels['invalid-component']
      );
    }
    message.push(
      `🟢 Tracker ${trackerController.adapter.getMarkdownUrl()} has set desired component: \`${component}\``
    );
  }

  if (!trackerController.adapter.isApproved()) {
    labels.add.push(config.labels.unapproved);
    err.push(
      `🔴 Tracker ${trackerController.adapter.getMarkdownUrl()} has not been approved`
    );
  } else {
    if (labelsFromPR.includes(config.labels.unapproved)) {
      removeLabel(
        octokit,
        owner,
        repo,
        prMetadata.number,
        config.labels.unapproved
      );
    }
    message.push(
      `🟢 Tracker ${trackerController.adapter.getMarkdownUrl()} has been approved`
    );
  }

  if (isMatchingProduct && isMatchingComponent) {
    const linkMessage = await trackerController.adapter.addLink(
      'https://github.com/',
      `${owner}/${repo}/pull/${prMetadata.number}`
    );
    notice(`🔗 ${linkMessage}`);

    const stateMessage = await trackerController.adapter.changeState();
    notice(`🎺 ${stateMessage}`);
  }

  // TODO: Once validated update Tracker status and add/update comment in PR

  setLabels(octokit, owner, repo, prMetadata.number, labels.add);

  if (err.length > 0) {
    raise(getFailedMessage(err) + '\n\n' + getSuccessMessage(message));
  }

  return getSuccessMessage(message);
}

export default action;
