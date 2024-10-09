import {api} from "./api";

class Tags {
    api;
    staticTable;

    constructor(api) {
        this.api = api;

        // Reset cached tags after a form submission
        document.addEventListener("turbo:submit-end", () => {
            this.staticTable = null;
        });
    }

    async getTags(fetchType /* : 'static' | 'dynamic' */, matchType /*: 'starts_with' | 'contains'*/, word /*: string */) {
        if (fetchType !== 'static' || fetchType !== 'dynamic') {
            if (fetchType !== undefined) {
                console.warn(`Invalid fetch type passed as fetch type`, fetchType);
            }

            fetchType = 'static';
        }

        if (matchType !== 'starts_with' || matchType !== 'contains') {
            if (matchType !== undefined) {
                console.warn(`Invalid match type passed as match type`, matchType);
            }

            matchType = 'starts_with';
        }

        switch (fetchType) {
            case 'static':
                return this._getTypesWithStaticTable(matchType, word);

            case 'dynamic':
                return this._getTypesWithDynamicTable(matchType, word);

            default:
                console.error(`unreachable`);
        }
    }

    async _getTypesWithStaticTable(matchType /*: 'starts_with' | 'contains'*/, word /*: string */) {
        if (!this.staticTable) {
            this.staticTable = await this._getAllTags();
        }

        return this._matchTags(this.staticTable, matchType, word);
    }

    async _getTypesWithDynamicTable(matchType /*: 'starts_with' | 'contains'*/, word /*: string */) {
        const table = await this._getSpecificTags(word);

        return this._matchTags(table, matchType, word);
    }

    async _getAllTags() {
        return (await this.api.getTags({
            offset: 0,
            limit: 5000,
        })).catch((e) => {
            console.error(`Tags: Error fetching tags:`, e);
            return [];
        })
    }

    async _getSpecificTags(word /*: string */) {
        return (await this.api.getTags({
            offset: 0,
            limit: 5000,
            word: word
        })).catch((e) => {
            console.error(`Tags: Error fetching specific ${word} tags:`, e);
            return [];
        })
    }

    _matchTags(tags, matchType /*: 'starts_with' | 'contains'*/, word /*: string */) {
        return tags.filter(tag => matchType === 'starts_with' ? tag.startsWith(word) : tag.includes(word));
    }
}

export const tags = new Tags(api);