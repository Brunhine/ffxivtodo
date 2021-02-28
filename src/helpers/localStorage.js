/** React */
import React from 'react';

/** app imports */
import { List } from '../data/items';
import { StorageKey } from '../enums';
import { listSort } from './listSort';

function getDefaultList() {
	var list = List;

	listSort(list.dailies);
	listSort(list.weeklies);

	return list;
}

export function mergeLists(baseList, customList) {

	mergeSubList(baseList, customList, 'dailies');
	mergeSubList(baseList, customList, 'weeklies');

	return baseList;
}

function mergeSubList(baseList, customList, type) {
	// If there are custom items
	if (customList && customList[type].length > 0) {
		const list = [...customList[type]];
		// check each custom item. if it is not in the list, add it.
		list.forEach(item => {
			if (baseList[type].filter(i => i.id === item.id).length === 0) {
				item.isCustom = true;
				baseList[type].push(item);
			}
		});
	}

	// remove all custom items that are no longer in the custom list
	if (customList)
		baseList[type] = baseList[type].filter(f => !f.isCustom || customList[type].filter(j => j.id === f.id).length > 0);

	listSort(baseList[type]);
}

export const UseStateWithLocalStorage = localStorageKey => {
	var res = null;
	switch (localStorageKey) {
		case StorageKey.List:
			res = mergeLists(JSON.parse(localStorage.getItem(StorageKey.List)) || getDefaultList(), JSON.parse(localStorage.getItem(StorageKey.Custom)));
			break;
		case StorageKey.Custom:
			res = JSON.parse(localStorage.getItem(StorageKey.Custom)) || { dailies: [], weeklies: [] };
			break;
		case StorageKey.Prefs:
			res = JSON.parse(localStorage.getItem(StorageKey.Prefs)) || { lastVersion: '0.0.0' };
			break;
		default:
			res = {};
			break;
	}

	const [value, setValue] = React.useState(res);

	React.useEffect(() => {
		localStorage.setItem(localStorageKey, JSON.stringify(value));
	}, [value, localStorageKey]);

	return [value, setValue];
};