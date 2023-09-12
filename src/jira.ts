import { debug } from '@actions/core';
import { Version2Client } from 'jira.js';

import { Adapter, IssueDetails } from './controller';
import { raise } from './util';
import { RemoteIssueLink } from 'jira.js/out/version2/models';

export class Jira implements Adapter<Version2Client> {
  readonly api: Version2Client;
  issueDetails: IssueDetails | undefined;

  constructor(readonly instance: string, apiToken: string) {
    this.api = new Version2Client({
      host: instance,
      authentication: {
        personalAccessToken: apiToken,
      },
    });
  }

  async getIssueDetails(id: string): Promise<IssueDetails> {
    const response = await this.api.issues.getIssue({ issueIdOrKey: id });

    this.issueDetails = {
      id: response.key,
      product: response.fields.versions[0]?.name ?? '',
      component: response.fields.components[0].name ?? '',
      summary: response.fields.summary,
      fixVersions: response.fields.fixVersions.map(version => version.name),
      status: response.fields.status.name ?? '',
    };

    return this.issueDetails;
  }

  async getVersion(): Promise<string> {
    const response = await this.api.serverInfo.getServerInfo();
    return response.version ?? raise('Jira.getVersion(): missing version.');
  }

  getUrl(): string {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.getUrl(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    return `${this.instance}/browse/${this.issueDetails.id}`;
  }

  getMarkdownUrl(): string {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.getUrl(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    return `[${this.issueDetails.id}](${this.getUrl()})`;
  }

  isMatchingProduct(products: string[] = []): boolean {
    // product matching is optional
    if (products.length === 0) {
      return true;
    }

    if (this.issueDetails === undefined) {
      raise(
        'Jira.isMatchingProduct(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    return products.includes(this.issueDetails.product);
  }

  isMatchingComponent(component: string): boolean {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.isMatchingComponent(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    return this.issueDetails.component === component;
  }

  isApproved(): boolean {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.isApproved(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    // Jira is approved if it has set Fix Version/s
    if (this.issueDetails.fixVersions !== undefined) {
      return this.issueDetails.fixVersions.length > 0;
    }

    return false;
  }

  async changeState(): Promise<string> {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.changeState(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    if (
      this.issueDetails.status !== 'New' &&
      this.issueDetails.status !== 'Planning'
    ) {
      debug(
        `Jira issue ${this.issueDetails.id} isn't in 'New' or 'Planning' state.`
      );
      return `Jira issue ${this.getMarkdownUrl()} has desired state.`;
    }

    debug(`Changing state of Jira ${this.issueDetails.id}.`);

    // The state can be changed only by a transition
    // In Progress transition id is 111
    // to get the transition id, use: https://issues.redhat.com/rest/api/2/issue/<RHEL-XXXX>/transitions
    await this.api.issues.doTransition({
      issueIdOrKey: this.issueDetails.id,
      transition: {
        id: '111',
      },
    });

    return `Jira issue ${this.getMarkdownUrl()} has changed state to 'In Progress'`;
  }

  async addLink(urlType: string, bugId: string): Promise<string> {
    if (this.issueDetails === undefined) {
      raise(
        'Jira.addLink(): missing issueDetails, call Jira.getIssueDetails() first.'
      );
    }

    // !FIXME: explicit type is required here because of a bug in jira.js
    const links: RemoteIssueLink[] =
      await this.api.issueRemoteLinks.getRemoteIssueLinks({
        issueIdOrKey: this.issueDetails.id,
      });

    for (const link of links) {
      if (link.object === undefined) {
        continue;
      }

      if (link.object.url === `${urlType}${bugId}`) {
        return `Link ${urlType}${bugId} is already linked with Jira issue ${this.getMarkdownUrl()}.`;
      }
    }

    await this.api.issueRemoteLinks.createOrUpdateRemoteIssueLink({
      issueIdOrKey: this.issueDetails.id,
      object: {
        title: `Fix has been submitted as GitHub PR ${bugId}`,
        url: `${urlType}${bugId}`,
        icon: {
          title: 'GitHub',
          url16x16: 'https://github.githubassets.com/favicon.ico',
        },
      },
    });

    return `PR was linked with Jira issue ${this.getMarkdownUrl()}`;
  }
}
