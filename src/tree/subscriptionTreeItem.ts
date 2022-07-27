import { createAzureClient, SubscriptionTreeItemBase } from '@microsoft/vscode-azext-azureutils';
import { IActionContext, AzExtTreeItem, AzExtParentTreeItem, ISubscriptionContext } from '@microsoft/vscode-azext-utils';
import { Subscription } from '@azure/arm-subscriptions';
import { Site, WebAppCollection } from 'azure-arm-website/lib/models';
import { WebAppTreeItem } from './webAppTreeItem';
import WebSiteManagementClient from 'azure-arm-website';


// The de facto API of tree nodes that represent individual Azure subscriptions.
// Tree items should implement this interface to maintain backward compatibility with previous versions of the extension.
export interface SubscriptionTreeNode {
    readonly nodeType: 'subscription';
    readonly name: string;
    readonly session: ISubscriptionContext;
    readonly subscription: Subscription;
}

export default class SubscriptionTreeItem extends SubscriptionTreeItemBase implements SubscriptionTreeNode {
     
    private _nextLink: string | undefined;
    constructor(
        parent: AzExtParentTreeItem,
        root: ISubscriptionContext) {
        super(parent, root);  
        //todo:change the path to relative
        this.iconPath="C:/Users/מירי/.vscode/mdc/node_modules/@microsoft/vscode-azext-azureutils/resources/azureSubscription.svg";
     }

    public readonly contextValue: string = 'azureutils.subscription';


    public hasMoreChildrenImpl(): boolean {
        return this._nextLink !== undefined;

    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        if (clearCache) {
            this._nextLink = undefined;
        }
        const client: WebSiteManagementClient = createAzureClient([context, this.subscription], WebSiteManagementClient.arguments);
        const webAppCollection: WebAppCollection = this._nextLink === undefined ?
            await client.webApps.list() :
            await client.webApps.listNext(this._nextLink);
        this._nextLink = webAppCollection.nextLink;
        return webAppCollection.map((site: Site, index: Number, array: Site[]) => new WebAppTreeItem(this, site));
    }

    public get name(): string {
        return this.subscription.subscriptionDisplayName || '';
    }

    public get session(): ISubscriptionContext {
        return this.session;
    }

    

    public readonly nodeType = 'subscription';
}