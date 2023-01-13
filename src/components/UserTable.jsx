import { useState, useMemo, useEffect, createContext, useContext } from 'react';
import ReactDataGrid, { SelectColumn, textEditor, SelectCellFormatter, useFocusRef} from 'react-data-grid';
import textEditorList from './textEditorList';

import UsersService from '../services/UsersService'//user service

const dateFormatter = new Intl.DateTimeFormat(navigator.language);

function TimestampFormatter({timestamp}) {
    return <>{dateFormatter.format(timestamp)}</>
} 

function autoFocusAndSelect(input) {
    input?.focus();
    input?.select();
}

function getColumns() {
    return [
        {
            key: 'id',
            name: 'ID',
            editor: textEditor,
            summaryFormatter() {
                return <strong>Всего</strong>
            }
        },
        {
            key: 'personalID',
            name: 'Табельный',
            editor: textEditor,
            summaryFormatter({ row }) {
                return <>{row.totalCount}</>
            }
        },
        {
            key: 'surname',
            name: 'Фамилия',
            editor: textEditorList
        },
        {
            key: 'name',
            name: 'Имя',
            editor: textEditorList
        },
        {
            key: 'lastname',
            name: 'Отчество',
            editor: textEditorList
        },
        {
            key: 'phone',
            name: 'Телефон',
            editor: textEditor
        },
        {
            key: 'email',
            name: 'E-mail',
            editor: textEditor
        },
        {
            key: 'position',
            name: 'Должность',
            editor: textEditor
        },
        {
            key: 'subdivision',
            name: 'Подраздеоение',
            editor: textEditor
        },
        {
            key: 'department',
            name: 'Организация',
            editor: textEditor
        },
        {
            key: 'status',
            name: 'Статус',
            editor: textEditor
        },
        {
            key: 'comment',
            name: 'Комментарий',
            editor: textEditor
        }
    ]
}

function rowKeyGetter(row) {
    return row.id;
}

function getComparator(sortColumn) {
    switch (sortColumn) {
        case 'id':
        case 'personalId':
        case 'phone':
        return (a, b) => {
            return a[sortColumn] - b[sortColumn]
        };
        case 'surname':
        case 'name':
        case 'lastname':
        case 'email':
        case 'position':
        case 'subdivision':
        case 'organization':
        case 'status':
        case 'comment':
        return (a, b) => {
            return a[sortColumn].localeCompare(b[sortColumn]);
        };
        default:
        throw new Error(`unsupported sortColumn: "${sortColumn}"`)
    }
}

const FilterContext = createContext(undefined);

function FilterRenderer({isCellSelected, column, children}) {
    const filters = useContext(FilterContext);
    const { ref, tabIndex } = useFocusRef(isCellSelected);

    return (
        <>
            <div>{column.name}</div>
            {filters.enable && <div>{children({ ref, tabIndex, filters })}</div>}
        </>
    )
}

export default function UserTable() {
    const [rows, setRows] = useState([]);
    const [sortColumns, setSortColumns] = useState([]);
    const [selectedRows, setSelectedRows] = useState(() => new Set());

    const retrieveUsers = async () => {
        await UsersService.getAll()
        .then((response) => {
            setRows(response.data);
        })
        .catch((e) => {
            console.log(e);
        });
    };

    useEffect(() => {
        retrieveUsers();
    }, []);

    const handleSetRows = async (rows, index) => {
        setRows(rows);
        const id = rows[index.indexes[0]].id;
        const value = {
            personalId: rows[index.indexes[0]].personalId,
            surname: rows[index.indexes[0]].surname,
            name: rows[index.indexes[0]].name,
            lastname: rows[index.indexes[0]].lastname,
            phone: rows[index.indexes[0]].phone,
            email: rows[index.indexes[0]].email,
            position: rows[index.indexes[0]].position,
            subdivision: rows[index.indexes[0]].subdivision,
            department: rows[index.indexes[0]].department,
            status: rows[index.indexes[0]].status,
            comment: rows[index.indexes[0]].comment
        }
        // await UsersService.update(id, value)
        // .then((res) => {
        //     console.log(res.data);
        // })
        // .catch((e) => {
        //     console.log(e);
        // });
    };

    const columns = useMemo(() => getColumns(), []);

    const summaryRows = useMemo(() => {
        const summaryRow = {
            id: 'total_0',
            totalCount: rows.length
        };
        return [summaryRow]
    }, [rows]);

    const sortedRows = useMemo(() => {
        if (sortColumns.length === 0) return rows;

        return [...rows].sort((a, b) => {
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

    const createNewRow = async () => {
        const emptyAccess = {
            id: rows.length === 0 ? 1 : rows[rows.length - 1].id + 1,
            personalId: null,
            surname: '',
            name: '',
            lastname: '',
            phone: null,
            email: '',
            position: '',
            subdivision: '',
            organization: '',
            status: null,
            comment: ''
        };
        console.log(rows)
        setRows([...rows, emptyAccess]);
        // await UsersService.create(emptyAccess)
        // .then((res) => {
        //     console.log(res.data);
        // })
        // .catch((e) => {
        //     console.log(e);
        // });
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
            onRowsChange={handleSetRows}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            bottomSummaryRows={summaryRows}
            className='fill-grid'
        />
    );

    return (
        <>
            {console.log(rows.map((c) => c))}
            <button onClick={createNewRow}>Add new row</button>
            {gridELement}
            <datalist id='surname'>
                <option key={1} value={1}>1</option>
                <option key={3} value={3}>3</option>
            </datalist>
        </>
    )
}