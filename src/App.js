import React from 'react';
import './App.css';

function YearTable(props) {
  console.log('YearTable', props);

  return (
    <div>
      <h2>Year Table</h2>
      <table>
        <tr>
          <th>Year</th>
          <th>Amount</th>
        </tr>
        {props.list.map((item) => (
          <tr>
            <td>{item.year}</td>
            <td>{item.amount}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

function SortTable(props) {
  console.log('SortTable', props);

  return (
    <div>
      <h2>Sort Table</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Amount</th>
        </tr>
        {props.list.map((item) => (
          <tr>
            <td>{item.date}</td>
            <td>{item.amount}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

function MonthTable(props) {
  console.log('MonthTable', props);

  return (
    <div>
      <h2>Month Table</h2>
      <table>
        <tr>
          <th>Month</th>
          <th>Amount</th>
        </tr>
        {props.list.map((item) => (
          <tr>
            <td>{item.month}</td>
            <td>{item.amount}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name | 'Component';
}

function withListAdaptation(WrappedComponent, adaptFn, propName = 'list') {
  const WithListAdaptation = (props) => {
    const { [propName]: list } = props;
    const preparedList = adaptFn(list);
    props = { ...props, [propName]: preparedList };
    return <WrappedComponent {...props} />;
  };

  const displayName = getDisplayName(WrappedComponent);
  const functionName = adaptFn.name || 'function';
  WithListAdaptation.displayName = `WithListAdaptation(${displayName}, ${functionName}, ${propName})`;
  return WithListAdaptation;
}

function sortByDate(list) {
  const clonedList = structuredClone(list);
  const compareFn = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  clonedList.sort(compareFn);
  return clonedList;
}

function groupByYear(list) {
  const yearToTotalAmount = {};
  list.forEach(({ date, amount }) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    if (yearToTotalAmount[year] == null) {
      yearToTotalAmount[year] = amount;
    } else {
      yearToTotalAmount[year] += amount;
    }
  });
  return Object.entries(yearToTotalAmount).map(([year, amount]) => ({
    year,
    amount,
  }));
}

const groupByMonth =
  (currentYear = null) =>
  (list) => {
    const monthToTotalAmount = {};
    list.forEach(({ date, amount }) => {
      const dateObj = new Date(date);
      if (currentYear != null && currentYear !== dateObj.getFullYear()) {
        return;
      }
      const month = dateObj.toLocaleString('en', { month: 'short' });

      if (monthToTotalAmount[month] == null) {
        monthToTotalAmount[month] = amount;
      } else {
        monthToTotalAmount[month] += amount;
      }
    });
    return Object.entries(monthToTotalAmount).map(([month, amount]) => ({
      month,
      amount,
    }));
  };

// const now = new Date();
const currentYear = 2017;

MonthTable = withListAdaptation(MonthTable, groupByMonth(currentYear));
YearTable = withListAdaptation(YearTable, groupByYear);
SortTable = withListAdaptation(SortTable, sortByDate);

const DATA_URL = process.env.REACT_APP_DATA_URL;

// TODO:
// 1. Загрузите данные с помощью fetch: https://raw.githubusercontent.com/netology-code/ra16-homeworks/master/hoc/aggregation/data/data.json
// 2. Не забудьте вынести URL в переменные окружения (не хардкодьте их здесь)
// 3. Положите их в state
export default class App extends React.Component {
  state = {
    list: [],
  };

  fetchData() {
    return fetch(DATA_URL).then((response) => response.json());
  }

  componentDidMount() {
    this.fetchData().then(({ list }) => this.setState({ list }));
  }

  render() {
    const { list } = this.state;
    return (
      <div id="app">
        <MonthTable list={list} />
        <YearTable list={list} />
        <SortTable list={list} />
      </div>
    );
  }
}
