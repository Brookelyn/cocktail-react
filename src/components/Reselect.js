import React, {Component} from 'react';

class Reselect extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchFilterValue: null,
			focussedOptionIndex: 0,
			resultsShowing: false,
			filteredData: props.data,
			hiddenInputValue: props.value
		};
	}

	/*-------------------------------------------------------------
		Handle when results are shown in the dropdown
	-------------------------------------------------------------*/
	componentWillReceiveProps(props) {
		// Update the local data state since we're being passed some new data.
		// The use case for this is if the select has some remote data that can
		// be searched
		let newState = {};
		if (props.value && props.data.length && !this.state.searchFilterValue) {
			let selectedOptionInData = props.data.find((option) => {
				if (props.saveByDescription === true) {
					return option.description === props.value;
				}
				return option.value === props.value;
			});
			if (selectedOptionInData) {
				newState.searchFilterValue = selectedOptionInData.description;
				newState.selectedOption = selectedOptionInData;
			} else {
				console.warn('The selected value passed to Reselect doesn\'t exist in it\'s the current data array, calling onNoResults');
				newState.searchFilterValue = this.props.value.toString();
				if (props.onNoResults) {
					props.onNoResults(newState.searchFilterValue);
				}
			}
		}
		newState.filteredData = this.getFilteredData(props.data, newState.searchFilterValue);
		this.setState(newState);
	}

	/*-------------------------------------------------------------
		Get filtered data depending on the user's current search
		Note: descriptions and search value is converted to string
		for this search so that descriptions that are integers or
		floats can still be searched as if they're text. This does
		not have any knock-on effects
	-------------------------------------------------------------*/
	getFilteredData(data, searchFilterValue) {
		let filteredData = data;
		if (searchFilterValue) {
			filteredData = data.filter((option) => {
				return option.description.toString().toLowerCase().indexOf(searchFilterValue.toString().toLowerCase()) > -1;
			});
		}
		return filteredData;
	}

	/*-------------------------------------------------------------
		Set search and handle no results callback
	-------------------------------------------------------------*/
	handleSearch(searchFilterValue) {
		let filteredData = this.getFilteredData(this.props.data, searchFilterValue);
		// Reset the current focussed option if the user has searched
		if (filteredData.length !== this.state.filteredData.length) {
			this.setState({
				searchFilterValue: searchFilterValue,
				focussedOptionIndex: 0,
				filteredData: filteredData
			});
		} else {
			this.setState({
				searchFilterValue: searchFilterValue,
				filteredData: filteredData
			});
		}
		// If the use has typed in a value and the reselect isn't already
		// downloading data and there's no results in the current dataset
		// then handle on no results callback. Use cases include fetching
		// new results based on the user's search
		if (this.props.loading === false && filteredData.length === 0 && this.props.onNoResults) {
			this.props.onNoResults(searchFilterValue);
		}
	}

	/*-------------------------------------------------------------
		When the user presses a key in the input, perform some
		shortcut actions
		Prevent enter from submitting the form
		Pressing down and up should highlight options
		Pressing tab or enter should select the current
		highlighted result
	-------------------------------------------------------------*/
	handleKeyboardShortcut(e) {
		let enterKey = e.keyCode === 13;
		let arrowDown = e.keyCode === 40;
		let arrowUp = e.keyCode === 38;
		let tabKey = e.keyCode === 9;

		if (enterKey) {
			e.preventDefault();
		}

		if (arrowDown) {
			// Arrow down
			let newFocussedOptionIndex = this.state.focussedOptionIndex + 1;
			if (this.state.focussedOptionIndex === this.state.filteredData.length - 1) {
				newFocussedOptionIndex = 0;
			}
			this.setState({
				focussedOptionIndex: newFocussedOptionIndex
			});
		} else if (arrowUp) {
			// Arrow up
			let newFocussedOptionIndex = this.state.focussedOptionIndex - 1;
			if (this.state.focussedOptionIndex === 0) {
				newFocussedOptionIndex = this.state.filteredData.length - 1;
			}
			this.setState({
				focussedOptionIndex: newFocussedOptionIndex
			});
		} else if (enterKey) {
			let selectedOption = this.state.filteredData[this.state.focussedOptionIndex];
			this.handleSearch(selectedOption.description);
			this.saveSelectedOption(selectedOption);
		} else if (tabKey) {
			// Handle blur -- may have to remove or reset search param to empty or previously selected value
			// so that it doesn't look like that value will save.
		}
	}

	/*-------------------------------------------------------------
		When the user hovers over an option set the focussed option
		index. Option index relates to the option's index in
		this.state.filteredData
	-------------------------------------------------------------*/
	setFocussedOptionIndex(optionIndex) {
		this.setState({
			focussedOptionIndex: optionIndex
		});
	}

	/*-------------------------------------------------------------
		Show and hide the results dropdown
	-------------------------------------------------------------*/
	showResults() {
		this.setState({
			resultsShowing: true
		});
	}

	hideResults() {
		this.setState({
			resultsShowing: false
		});
	}

	/*-------------------------------------------------------------
		When the selects an option from the dropdown, set it
		in internal state
	-------------------------------------------------------------*/
	saveSelectedOption(option) {
		this.setState({
			selectedOption: option
		});
		this.props.onChange(option);
	}

	/*-------------------------------------------------------------
		If the user blurs the input,
	-------------------------------------------------------------*/
	removeValueIfThereIsntAnExactMatchInTheSearch() {
		let selectedOptionInData = this.props.data.find((option) => {
			return option.description === this.state.searchFilterValue;
		});

		if (!selectedOptionInData) {
			this.saveSelectedOption(null);
			this.setState({
				searchFilterValue: ''
			});
		}
	}

	/*-------------------------------------------------------------
		Render reselect
		If there's a selected result then set it on the hidden
		input's value
	-------------------------------------------------------------*/
	render() {
		let hiddenInputValue = '';
		if (this.state.selectedOption) {
			if (this.props.saveByValue) {
				hiddenInputValue = this.state.selectedOption.value;
			} else {
				hiddenInputValue = this.state.selectedOption.description;
			}
		}

		return (
			<div className="f f-1 reselect">
				<input className="reselect-input"
					type="text"
					value={this.state.searchFilterValue}
					disabled={this.props.disabled}
					autoComplete="off"
					placeholder={this.props.placeholder}
					onFocus={() => {
						this.showResults();
					}}
					onBlur={() => {
						this.removeValueIfThereIsntAnExactMatchInTheSearch();
						this.hideResults();
					}}
					onChange={(e) => {
						this.handleSearch(e.target.value);
					}}
					onKeyDown={(e) => {
						this.handleKeyboardShortcut(e);
					}} />
				<input type="hidden"
					name={this.props.name}
					disabled={this.props.disabled}
					value={hiddenInputValue} />
				{this.renderReselectResults()}
			</div>
		);
	}

	renderReselectResults() {
		if (this.state.resultsShowing) {
			if (this.props.loading === true) {
				return (
					<div className="reselect-dropdown">
						<div className="reselect-dropdown-item">
							{"Loading"}
						</div>
					</div>
				);
			} else if (this.state.filteredData.length === 0) {
				return (
					<div className="reselect-dropdown">
						<div className="reselect-dropdown-item">
							{"No results"}
						</div>
					</div>
				);
			}
			return (
				<div className="reselect-dropdown">
					{this.state.filteredData.map((option, i) => {
						let optionClass;
						if (i === this.state.focussedOptionIndex) {
							optionClass = 'selected';
						}
						return (
							<div key={i}
								className={`${optionClass} reselect-dropdown-item`}
								onMouseDown={() => {
									this.handleSearch(option.description);
									this.saveSelectedOption(option);
								}}
								onMouseEnter={() => {
									this.setFocussedOptionIndex(i);
								}}>
								{option.description}
							</div>
						);
					})}
				</div>
			);
		}
	}
}

Reselect.propTypes = {
	/*-------------------------------------------------------------
		Used to set <input name="blah" />. Should be set if a form,
		where the form compiles the JSON.
	-------------------------------------------------------------*/
	name: React.PropTypes.string,

	/*-------------------------------------------------------------
		An array of options to show in the list. Gets filtered
		internally by searchValue when the user types in the input.
		metaData refers to any extra information the user wants to
		store relating to the option that gets passed to the
		onChange()
	-------------------------------------------------------------*/
	data: React.PropTypes.arrayOf(React.PropTypes.shape({
		description: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]).isRequired,
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]).isRequired,
		metaData: React.PropTypes.object
	})).isRequired,

	/*-------------------------------------------------------------
		The selected value. Should match either the value or
		description of one of the objects in data[] depending on
		whether the reselect is configured to saveByValue or
		saveByDescription
	-------------------------------------------------------------*/
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),

	/*-------------------------------------------------------------
		Set to true if reselect is waiting on some remote data
	-------------------------------------------------------------*/
	loading: React.PropTypes.bool,

	/*-------------------------------------------------------------
		Set to true if reselect should be rendered in disabled mode
	-------------------------------------------------------------*/
	disabled: React.PropTypes.bool,

	/*-------------------------------------------------------------
		If the reselect should pass a data object's value key to
		the onChange function. This is default.
	-------------------------------------------------------------*/
	saveByValue: React.PropTypes.bool,

	/*-------------------------------------------------------------
		If the reselect should pass a data object's description key
		to the onChange function. This is default.
	-------------------------------------------------------------*/
	saveByDescription: React.PropTypes.bool,

	/*-------------------------------------------------------------
		A callback for when the user enters a value in the search
		that does correspond to any of the options in data[]
	-------------------------------------------------------------*/
	onNoResults: React.PropTypes.func,

	/*-------------------------------------------------------------
		A callback when the user selects an option from the results
		list. Should usually update the value prop full-cycle.
	-------------------------------------------------------------*/
	onChange: React.PropTypes.func,

	/*-------------------------------------------------------------
		If the Reselect input field requires a placeholder. The
		default is for this to be blank.
	-------------------------------------------------------------*/
	placeholder: React.PropTypes.string
};

Reselect.defaultProps = {
	data: [],
	onNoResults: () => {},
	placeholder: ''
};

export default Reselect;
