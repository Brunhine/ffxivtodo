/** React */
import React from 'react';

/** react-bootstrap */
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

/** app imports */
import { TodoList } from './todoList';
import { UseStateWithLocalStorage } from './helpers/localStorage';
import { List } from './data/items';
import { NavBar } from './layout/navBar';
import { UpgradeAlert } from './upgradeAlert';
import { ConsentAlert } from './consentAlert';
import { StorageKey } from './enums';
import { listSort } from './helpers/listSort';
import { mergeLists } from './helpers/localStorage';

export function Main() {
	const [todos, setTodos] = UseStateWithLocalStorage(StorageKey.List);
	const [prefs] = UseStateWithLocalStorage(StorageKey.Prefs);
	const [dailiesCanReset, setDailiesCanReset] = React.useState(todos.dailies.filter(t => t.isCompleted === true).length > 0);
	const [weekliesCanReset, setWeekliesCanReset] = React.useState(todos.weeklies.filter(t => t.isCompleted === true).length > 0);
	const [hideShowMode, setHideShowMode] = React.useState(false);

	/**
	 * Marks a TodoItem as complete
	 * @param {string} type The type of TodoItem ("daily or "weekly)
	 * @param {int}    name The name of the item in its respective category
	 */
	const completeTodo = (type, name) => {
		const version = todos.version;
		const newTodos = [...todos[type]];
		newTodos.find(t => t.name === name).isCompleted = !newTodos.find(t => t.name === name).isCompleted;
		listSort(newTodos);
		todos[type] = newTodos;

		if (type === 'dailies') {
			setDailiesCanReset(newTodos.filter(t => t.isCompleted === true).length > 0);
			setTodos({ 'version': version, 'dailies': newTodos, 'weeklies': todos.weeklies });
		} else {
			setWeekliesCanReset(newTodos.filter(t => t.isCompleted === true).length > 0);
			setTodos({ 'version': version, 'dailies': todos.dailies, 'weeklies': newTodos });
		}
	};

	/**
	 * Toggles Show/Hide mode so that users can hide or show specific list items
	 */
	const toggleShowHideMode = () => {
		setHideShowMode(!hideShowMode);
	}

	/**
	 * Toggles the 'hidden'property for the specified list item
	 * @param {string} type The category of the list item
	 * @param {string} name The name of the item to be hidden or shown
	 */
	const hideTodo = (type, name) => {
		const version = todos.version;
		const newTodos = [...todos[type]];
		var todo = newTodos.find(t => t.name === name);
		todo.hidden = !todo.hidden;
		todo.isCompleted = false;

		if (type === 'dailies') {
			setDailiesCanReset(newTodos.filter(t => t.isCompleted === true).length > 0);
			setTodos({ 'version': version, 'dailies': newTodos, 'weeklies': todos.weeklies });
		} else {
			setWeekliesCanReset(newTodos.filter(t => t.isCompleted === true).length > 0);
			setTodos({ 'version': version, 'dailies': todos.dailies, 'weeklies': newTodos });
		}
	}

	/**
	 * Resets progress on the specified list by marking all items as incomplete
	 * @param {string} type The type of TodoItem ("daily or "weekly)
	 */
	const resetProgress = type => {
		const version = todos.version;
		const newTodos = [...todos[type]];
		newTodos.forEach(element => {
			element.isCompleted = false;
		});
		newTodos.sort((a, b) => a.name.localeCompare(b.name));
		if (type === 'dailies') {
			setDailiesCanReset(false);
			setTodos({ 'version': version, 'dailies': newTodos, 'weeklies': todos.weeklies });
		} else {
			setWeekliesCanReset(false);
			setTodos({ 'version': version, 'dailies': todos.dailies, 'weeklies': newTodos });
		}
	}

	/**
	 * Resets all of the lists to the default base list
	 * Clears all local storage and reloads the window
	 */
	const resetToDefaults = () => {
		console.info('Resetting all lists to default state.');
		localStorage.clear();
		window.location.reload();
	};

	/**
	 * Provides functionality to upgrade the list in the user's localstorage to a new version 
	 * in the event that the list was changed.
	 */
	const upgradeList = () => {
		let newTodos = mergeLists(List, JSON.parse(localStorage.getItem(StorageKey.Custom)));

		['dailies', 'weeklies'].forEach(type => {
			newTodos[type].forEach((i) => {
				var curr = todos[type].find(obj => obj.name === i.name);
				if (curr) {
					i.isCompleted = curr.isCompleted;
				}
			});
			newTodos[type] = List[type].sort((a, b) => a.isCompleted - b.isCompleted || a.name.localeCompare(b.name));
		});

		setDailiesCanReset(newTodos.dailies.filter(t => t.isCompleted === true).length > 0);
		setWeekliesCanReset(newTodos.weeklies.filter(t => t.isCompleted === true).length > 0);

		setTodos(newTodos);

		window.location.reload();
	}

	window.upgradeList = upgradeList;

	// Build values for progress bars
	let dailyComplete = (todos.dailies.filter(d => d.hidden !== true && d.isCompleted === true).length / todos.dailies.filter(d => d.hidden !== true).length) * 100;
	let weeklyComplete = (todos.weeklies.filter(d => d.hidden !== true && d.isCompleted === true).length / todos.weeklies.filter(d => d.hidden !== true).length) * 100;

	return (
		<div>
			<NavBar
				showHideModeEnabled={hideShowMode}
				toggleShowHideMode={toggleShowHideMode}
				resetDefaults={resetToDefaults}
				prefs={prefs} />
			<Container>
				<UpgradeAlert todos={todos} upgradeList={upgradeList} />
				<Container>
					<Row>
						<Col sm={12} md={6} className='todoList'>
							<TodoList
								title='dailies'
								todos={todos.dailies}
								completePercent={dailyComplete}
								completeTodo={completeTodo}
								hideTodo={hideTodo}
								reset={resetProgress}
								canReset={dailiesCanReset}
								hideShowModeEnabled={hideShowMode}
								prefs={prefs}
							/>
						</Col>
						<Col sm={12} md={6} className='todoList'>
							<TodoList
								title='weeklies'
								todos={todos.weeklies}
								completePercent={weeklyComplete}
								completeTodo={completeTodo}
								hideTodo={hideTodo}
								reset={resetProgress}
								canReset={weekliesCanReset}
								hideShowModeEnabled={hideShowMode}
								prefs={prefs}
							/>
						</Col>
					</Row>
				</Container>
			</Container>
			<ConsentAlert />
		</div>
	);
}