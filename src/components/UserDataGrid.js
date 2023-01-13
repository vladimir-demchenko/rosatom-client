import { useState, useMemo} from 'react';
import { createPortal } from 'react-dom';

import ReactDataGrid, { SelectColumn, textEditor, SelectCellFormatter } from 'react-data-grid';
import { faker } from '@faker-js/faker';


const dateFormatter = new Intl.DateTimeFormat(navigator.language);
const currencyFormatter = new Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: 'eur'
});

function TimestampFormatter({ timestamp }) {
  return <>{dateFormatter.format(timestamp)}</>;
}

function CurrencyFormatter({ value }) {
  return <>{currencyFormatter.format(value)}</>;
}

function getColumns(countries, direction) {
    return [
        SelectColumn,
        {
            key: 'id',
            name: 'ID',
            width: 60,
            frozen: true,
            resizable: false,
            editor: textEditor,
            summaryFormatter() {
              return <strong>Total</strong>;
            }
        },
        {
            key: 'title',
            name: 'Task',
            width: 120,
            frozen: true,
            editor: textEditor,
            summaryFormatter({ row }) {
                return <>{row.totalCount}</>
            }
        },
        {
            key: 'client',
            name: 'Client',
            width: 'max-content',
            editor: textEditor
        },
        {
            key: 'area',
            name: 'Area',
            width: 120,
            editor: textEditor
          },
          {
            key: 'country',
            name: 'Country',
            width: 180,
            editor: (p) => (
              <select
                autoFocus
                value={p.row.country}
                onChange={(e) => p.onRowChange({ ...p.row, country: e.target.value }, true)}
              >
                {countries.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            ),
            editorOptions: {
              editOnClick: true
            }
          },
          {
            key: 'contact',
            name: 'Contact',
            width: 160,
            editor: textEditor
          },
          {
            key: 'assignee',
            name: 'Assignee',
            width: 150,
            editor: textEditor,
            editorOptions: {
              editOnClick: true
            }
          },
          {
            key: 'progress',
            name: 'Completion',
            width: 110,
            formatter(props) {
              const value = props.row.progress;
              return (
                <>
                  <progress max={100} value={value} style={{ inlineSize: 50 }} /> {Math.round(value)}%
                </>
              );
            },
            editor({ row, onRowChange, onClose }) {
              return createPortal(
                <div
                  dir={direction}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      onClose();
                    }
                  }}
                >
                  <dialog open>
                    <input
                      autoFocus
                      type="range"
                      min="0"
                      max="100"
                      value={row.progress}
                      onChange={(e) => onRowChange({ ...row, progress: e.target.valueAsNumber })}
                    />
                    <menu>
                      <button onClick={() => onClose()}>Cancel</button>
                      <button onClick={() => onClose(true)}>Save</button>
                    </menu>
                  </dialog>
                </div>,
                document.body
              );
            },
            editorOptions: {
              renderFormatter: true
            }
          },
          {
            key: 'startTimestamp',
            name: 'Start date',
            width: 100,
            formatter(props) {
              return <TimestampFormatter timestamp={props.row.startTimestamp} />;
            }
          },
          {
            key: 'endTimestamp',
            name: 'Deadline',
            width: 100,
            formatter(props) {
              return <TimestampFormatter timestamp={props.row.endTimestamp} />;
            }
          },
          {
            key: 'budget',
            name: 'Budget',
            width: 100,
            formatter(props) {
              return <CurrencyFormatter value={props.row.budget} />;
            }
          },
          {
            key: 'transaction',
            name: 'Transaction type'
          },
          {
            key: 'account',
            name: 'Account',
            width: 150
          },
          {
            key: 'version',
            name: 'Version',
            editor: textEditor
          },
          {
            key: 'available',
            name: 'Available',
            width: 80,
            formatter({ row, onRowChange, isCellSelected }) {
              return (
                <SelectCellFormatter
                  value={row.available}
                  onChange={() => {
                    onRowChange({ ...row, available: !row.available });
                  }}
                  isCellSelected={isCellSelected}
                />
              );
            },
            summaryFormatter({ row: { yesCount, totalCount } }) {
              return <>{`${Math.floor((100 * yesCount) / totalCount)}% ✔️`}</>;
            }
          }
    ];
}

function rowKeyGetter(row) {
    return row.id;
}

function createRows() {
    const now = Date.now();
    const rows = [];

    for (let i = 0; i < 10; i++){
        rows.push({
            id: i,
            title: `Task #${i + 1}`,
            client: faker.company.name(),
            area: faker.name.jobArea(),
            country: faker.address.country(),
            contact: faker.internet.exampleEmail(),
            assignee: faker.name.fullName(),
            progress: Math.random() * 100,
            startTimestamp: now - Math.round(Math.random() * 1e10),
            endTimestamp: now + Math.round(Math.random() * 1e10),
            budget: 500 + Math.random() * 10500,
            transaction: faker.finance.transactionType(),
            account: faker.finance.iban(),
            version: faker.system.semver(),
            available: Math.random() > 0.5
        });
    }

    return rows;
}

function getComparator(sortColumn) {
    switch (sortColumn) {
        case 'assignee':
        case 'title':
        case 'client':
        case 'area':
        case 'country':
        case 'contact':
        case 'transaction':
        case 'account':
        case 'version':
        return (a, b) => {
            return a[sortColumn].localeCompare(b[sortColumn]);
        };
        case 'available':
        return (a, b) => {
            return a[sortColumn] === b[sortColumn] ? 0 : a[sortColumn] ? 1 : -1;
        };
        case 'id':
        case 'progress':
        case 'startTimestamp':
        case 'endTimestamp':
        case 'budget':
        return (a, b) => {
            return a[sortColumn] - b[sortColumn];
        };
        default:
        throw new Error(`unsupported sortColumn: "${sortColumn}"`);
    }
}

export default function UserDataGrid({direction}) {
    const [rows, setRows] = useState(createRows);
    const [sortColumns, setSortColumns] = useState([]);
    const [selectedRows, setSelectedRows] = useState(() => new Set());

    const countries = useMemo(() => {
      return [...new Set(rows.map((r) => r.country))].sort(new Intl.Collator().compare);
    }, [rows]);
    const columns = useMemo(() => getColumns(countries, direction), [countries, direction]);
    
    const summaryRows = useMemo(() => {
        const summaryRow = {
            id: 'total_0',
            totalCount: rows.length,
            yesCount: rows.filter((r) => r.available).length
        };
        return [summaryRow];
    }, [rows]);

    const sortedRows = useMemo(() => {
        if (sortColumns.length === 0) return rows;

        return [...rows].sort((a,b) => {
            for (const sort of sortColumns) {
                const comparator = getComparator(sort.columnKey);
                const compResult = comparator(a, b);
                if (compResult !== 0) {
                    return sort.direction === 'ASC' ? compResult : -compResult;
                }
            }
            return 0;
        });
    }, [rows, sortColumns]);

    const createNewRow = () => {
        const emptyUser = {
          id: rows[rows.length - 1].id + 1,
          title: '',
          client: '',
          area: '',
          country: faker.address.country(),
          contact: '',
          assignee: '',
          progress: 0,
          startTimestamp: null,
          endTimestamp:null,
          budget: null,
          transaction: '',
          account: '',
          version: '',
          available: 0
        }
        console.log(rows);
        setRows([...rows, emptyUser]);
        console.log(sortColumns);
    }

    const gridELement = (
        <ReactDataGrid
            rowKeyGetter={rowKeyGetter}
            columns={columns}
            rows={sortedRows}
            defaultColumnOptions={{
                sortable: true,
                resizable: true
            }}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            onRowsChange={setRows}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            topSummaryRows={summaryRows}
            className="fill-grid"
            direction={direction}    
        />
    );

    return (
        <>
          <button onClick={createNewRow}>Add new row</button>
            {gridELement}
        </>
    )
}